import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import dotenv from 'dotenv';
import { roomManager } from './roomManager.js';
import { exportRoomToCsv, getEventLogs, db } from './db.js';
import { setupSocketHandlers } from './socketHandler.js';
import {
  verifyAdminCode,
  createAdminSessionToken,
  requireAdmin,
  ADMIN_COOKIE_NAME,
  isIpLocked,
  recordFailedLogin,
  resetFailedLogins,
} from './auth.js';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  maxHttpBufferSize: 1e6, // 1MB payload limit
});

// Setup security headers & cookie parsing
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: '500kb' }));

// Anti-Indexing & robots tag for admin paths
app.use((req: Request, res: Response, next) => {
  if (req.path.startsWith('/gogo') || req.path.startsWith('/api/admin')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
  next();
});

// Strict robots.txt
app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /gogo/\nDisallow: /api/admin/\n');
});

// Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Strict rate limit for admin login attempts
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Schema validation
const CreateRoomSchema = z.object({
  title: z.string().min(2).max(64).optional(),
  language: z.string().default('en'),
  timerSeconds: z.number().int().min(15).max(300).default(60),
  attemptsPerParticipant: z.number().int().min(1).max(5).default(1),
  minAccuracy: z.number().min(50).max(100).default(90),
  maxParticipants: z.number().int().min(2).max(200).default(150),
  isPrivate: z.boolean().default(false),
  backspaceMode: z.enum(['all', 'word', 'none']).default('all'),
  hasPunctuation: z.boolean().default(true),
  hasNumbers: z.boolean().default(false),
  scheduledStartTime: z.number().optional(),
});

// ==========================================
// PUBLIC ROUTES (Participants Only)
// ==========================================

// 1. Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: Date.now(),
    memory: process.memoryUsage(),
    connectedSockets: io.sockets.sockets.size,
  });
});

// Public attempts to create rooms are rejected (Must use admin)
app.post('/api/rooms', (req: Request, res: Response) => {
  res.status(403).json({
    error: 'Restricted: Room creation requires tournament administrator authentication.',
  });
});

// 2. Get Public Room Snapshot (Resolves 8-char code OR 6-digit number)
app.get('/api/rooms/:roomId', (req: Request, res: Response) => {
  const code = String(req.params.roomId || '').toUpperCase().trim();
  const room = roomManager.getRoom(code);
  if (!room) {
    res.status(404).json({ error: 'Room not found or expired.' });
    return;
  }
  const snapshot = roomManager.getSnapshot(room.config.roomId);
  res.json(snapshot);
});

// 3. Export CSV Results
app.get('/api/rooms/:roomId/export.csv', (req: Request, res: Response) => {
  const code = String(req.params.roomId || '').toUpperCase().trim();
  const room = roomManager.getRoom(code);
  if (!room) {
    res.status(404).send('Room not found');
    return;
  }
  const results = roomManager.getLeaderboard(room.config.roomId);
  const csvData = exportRoomToCsv(room.config.roomId, results);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="CodeMeet2026_${room.config.roomId}_results.csv"`);
  res.send(csvData);
});

// 4. Export JSON Results
app.get('/api/rooms/:roomId/export.json', (req: Request, res: Response) => {
  const code = String(req.params.roomId || '').toUpperCase().trim();
  const room = roomManager.getRoom(code);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }
  const results = roomManager.getLeaderboard(room.config.roomId);
  res.json({
    event: 'CODE MEET 2026 - Speed Typer Championship',
    roomId: room.config.roomId,
    numericCode: room.config.numericCode,
    exportedAt: new Date().toISOString(),
    results,
  });
});

// ==========================================
// ADMIN AUTHENTICATION ROUTES (/api/admin)
// ==========================================

// Admin Login
app.post('/api/admin/login', adminLoginLimiter, (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (isIpLocked(clientIp)) {
    res.status(429).json({
      error: 'Account locked due to consecutive failed attempts. Try again in 15 minutes.',
    });
    return;
  }

  const { code } = req.body || {};
  if (!code || typeof code !== 'string') {
    recordFailedLogin(clientIp);
    res.status(401).json({ error: 'Invalid administrative access code.' });
    return;
  }

  if (!verifyAdminCode(code)) {
    recordFailedLogin(clientIp);
    res.status(401).json({ error: 'Invalid administrative access code.' });
    return;
  }

  // Login successful
  resetFailedLogins(clientIp);
  const sessionToken = createAdminSessionToken();

  res.cookie(ADMIN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });

  res.json({
    success: true,
    token: sessionToken,
    expiresIn: 8 * 3600,
  });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  res.clearCookie(ADMIN_COOKIE_NAME);
  res.json({ success: true });
});

// Admin Auth Status Verification
app.get('/api/admin/me', requireAdmin, (req: Request, res: Response) => {
  res.json({ authenticated: true, role: 'admin' });
});

// ==========================================
// ADMIN CONTROL CENTER API (All Require requireAdmin)
// ==========================================

// List all rooms for admin dashboard
app.get('/api/admin/rooms', requireAdmin, (req: Request, res: Response) => {
  const list = roomManager.getAllRoomsList();
  res.json({ rooms: list });
});

// Admin: Create New Room (Dual Code generation: 8-char code + 6-digit numeric)
app.post('/api/admin/rooms', requireAdmin, (req: Request, res: Response) => {
  const parseResult = CreateRoomSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.flatten() });
    return;
  }

  const { room, hostToken, code, numericCode } = roomManager.createRoom(parseResult.data);

  res.status(201).json({
    success: true,
    code,
    numericCode,
    hostToken,
    room: {
      roomId: room.config.roomId,
      numericCode: room.config.numericCode,
      title: room.config.title,
      timerSeconds: room.config.timerSeconds,
      minAccuracy: room.config.minAccuracy,
      attemptsPerParticipant: room.config.attemptsPerParticipant,
    },
  });
});

// Admin: Get Full Live Monitor Details
app.get('/api/admin/rooms/:roomId/monitor', requireAdmin, (req: Request, res: Response) => {
  const code = String(req.params.roomId || '').toUpperCase().trim();
  const room = roomManager.getRoom(code);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const snapshot = roomManager.getSnapshot(room.config.roomId);
  const participants = Array.from(room.participants.values());
  const submissions = Array.from(room.submissions.values());

  res.json({
    snapshot,
    participants,
    submissions,
    metrics: {
      total: participants.length,
      joined: participants.filter((p) => p.status === 'joined').length,
      ready: participants.filter((p) => p.status === 'ready').length,
      typing: participants.filter((p) => p.status === 'typing').length,
      finished: participants.filter((p) => p.status === 'finished').length,
      disconnected: participants.filter((p) => p.status === 'disconnected').length,
      flagged: submissions.filter((s) => s.flaggedForReview).length,
    },
  });
});

// Admin: Duplicate Room
app.post('/api/admin/rooms/:roomId/duplicate', requireAdmin, (req: Request, res: Response) => {
  const code = String(req.params.roomId || '').toUpperCase().trim();
  const result = roomManager.duplicateRoom(code);
  if (!result) {
    res.status(404).json({ error: 'Source room not found' });
    return;
  }
  res.json({ success: true, code: result.code, numericCode: result.numericCode });
});

// Admin: Delete Room
app.delete('/api/admin/rooms/:roomId', requireAdmin, (req: Request, res: Response) => {
  const code = String(req.params.roomId || '').toUpperCase().trim();
  const success = roomManager.deleteRoom(code);
  res.json({ success });
});

// Admin: Audit Event Logs
app.get('/api/admin/events', requireAdmin, (req: Request, res: Response) => {
  const roomId = req.query.roomId ? String(req.query.roomId).toUpperCase() : undefined;
  const severity = req.query.severity ? String(req.query.severity) : undefined;
  const type = req.query.type ? String(req.query.type) : undefined;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 200;

  const logs = getEventLogs({ roomId, severity, type, limit });
  res.json({ logs });
});

// Admin: System Health Diagnostics
app.get('/api/admin/health', requireAdmin, (req: Request, res: Response) => {
  let dbStatus = 'healthy';
  try {
    db.prepare('SELECT 1').get();
  } catch {
    dbStatus = 'degraded';
  }

  res.json({
    serverUptime: Math.floor(process.uptime()),
    connectedSockets: io.sockets.sockets.size,
    memory: process.memoryUsage(),
    dbStatus,
    timestamp: Date.now(),
  });
});

// Serve frontend in production if built
const CLIENT_DIST = fs.existsSync(path.resolve(process.cwd(), '../client/dist'))
  ? path.resolve(process.cwd(), '../client/dist')
  : path.resolve(process.cwd(), 'client/dist');

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// Setup Socket.IO Event Handlers
setupSocketHandlers(io);

// Start server only when not running in test or load-test mode
const isRunningInTest =
  process.env.NODE_ENV === 'test' ||
  process.argv.some((arg) => arg.includes('test') || arg.includes('loadTest') || arg.includes('vitest'));

if (!isRunningInTest) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  CODE MEET 2026 SPEED TYPER SERVER READY`);
    console.log(`  Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Admin Gateway: /gogo`);
    console.log(`  Health Check: http://localhost:${PORT}/health`);
    console.log(`====================================================`);
  });
}

export { app, server };
