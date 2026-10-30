import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { logEvent } from './db.js';

const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || '20268899';
const SESSION_SECRET = process.env.SESSION_SECRET || 'codemeet-2026-super-secure-secret-key-32b';
export const ADMIN_COOKIE_NAME = 'admin_session';

// In-memory rate limiting map for admin login: IP -> { failedAttempts: number, lockedUntil: number }
interface LoginAttemptRecord {
  failedAttempts: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, LoginAttemptRecord>();

export function isIpLocked(ip: string): boolean {
  const record = loginAttempts.get(ip);
  if (!record) return false;
  if (Date.now() < record.lockedUntil) {
    return true;
  }
  // Lock expired
  loginAttempts.delete(ip);
  return false;
}

export function recordFailedLogin(ip: string): void {
  const record = loginAttempts.get(ip) || { failedAttempts: 0, lockedUntil: 0 };
  record.failedAttempts += 1;
  if (record.failedAttempts >= 5) {
    // 15-minute lockout
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
    logEvent({
      type: 'admin_login_locked',
      severity: 'warn',
      actor: ip,
      message: `IP ${ip} locked out for 15 minutes after 5 failed login attempts.`,
    });
  }
  loginAttempts.set(ip, record);

  logEvent({
    type: 'admin_login_failed',
    severity: 'warn',
    actor: ip,
    message: `Failed admin login attempt from IP ${ip} (${record.failedAttempts}/5)`,
  });
}

export function resetFailedLogins(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Constant-time comparison to prevent timing attacks.
 */
export function verifyAdminCode(code: string): boolean {
  if (typeof code !== 'string') return false;
  const targetCode = process.env.ADMIN_ACCESS_CODE || ADMIN_ACCESS_CODE;

  const codeBuffer = Buffer.from(code.trim());
  const targetBuffer = Buffer.from(targetCode.trim());

  if (codeBuffer.length !== targetBuffer.length) {
    // Perform dummy timing-safe compare on self to maintain constant-time response
    crypto.timingSafeEqual(codeBuffer, codeBuffer);
    return false;
  }

  return crypto.timingSafeEqual(codeBuffer, targetBuffer);
}

/**
 * Creates a signed 8-hour admin session token.
 */
export function createAdminSessionToken(): string {
  const payload = JSON.stringify({
    isAdmin: true,
    iat: Date.now(),
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  });

  const b64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(b64Payload)
    .digest('base64url');

  return `${signature}.${b64Payload}`;
}

/**
 * Verifies signed session token.
 */
export function verifyAdminSession(token: string | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [sig, b64Payload] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(b64Payload)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    if (!payload.isAdmin || typeof payload.exp !== 'number') return false;
    if (Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Express middleware requiring authenticated admin session.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const cookieToken = (req as any).cookies?.[ADMIN_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  const token = cookieToken || bearerToken;

  if (!token || !verifyAdminSession(token)) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
    return;
  }

  next();
}
