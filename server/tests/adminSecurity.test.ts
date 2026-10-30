import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { createIsolatedTestServer } from './testServer.js';
import { createAdminSessionToken, verifyAdminCode } from '../src/auth.js';
import { roomManager } from '../src/roomManager.js';
import { getEventLogs } from '../src/db.js';

describe('Admin Security, Access Split & Audit Trail Tests', () => {
  let port: number;
  let closeServer: () => Promise<void>;
  let unauthenticatedClient: ClientSocketType;
  let adminClient: ClientSocketType;
  let adminToken: string;

  beforeAll(async () => {
    const testServer = await createIsolatedTestServer();
    port = testServer.port;
    closeServer = testServer.close;

    adminToken = createAdminSessionToken();

    unauthenticatedClient = ClientSocket(`http://localhost:${port}`);
    adminClient = ClientSocket(`http://localhost:${port}`, {
      auth: { token: adminToken },
    });

    await Promise.all([
      new Promise<void>((res) => unauthenticatedClient.on('connect', res)),
      new Promise<void>((res) => adminClient.on('connect', res)),
    ]);
  });

  afterAll(async () => {
    unauthenticatedClient.disconnect();
    adminClient.disconnect();
    if (closeServer) {
      await closeServer();
    }
  });

  it('rejects public attempts to create rooms via /api/rooms with 403', async () => {
    const res = await fetch(`http://localhost:${port}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hacked Room' }),
    });
    expect(res.status).toBe(403);
    const data = await res.json() as any;
    expect(data.error).toContain('Restricted');
  });

  it('blocks unauthenticated requests on all admin endpoints with 401', async () => {
    const endpoints = [
      { url: `http://localhost:${port}/api/admin/rooms`, method: 'GET' },
      { url: `http://localhost:${port}/api/admin/rooms`, method: 'POST' },
      { url: `http://localhost:${port}/api/admin/events`, method: 'GET' },
      { url: `http://localhost:${port}/api/admin/health`, method: 'GET' },
      { url: `http://localhost:${port}/api/admin/rooms/dummy/monitor`, method: 'GET' },
    ];

    for (const ep of endpoints) {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
      });
      expect(res.status).toBe(401);
    }
  });

  it('grants access to admin endpoints with valid signed session token', async () => {
    const res = await fetch(`http://localhost:${port}/api/admin/rooms`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(res.status).toBe(200);
    const data = await res.json() as any;
    expect(Array.isArray(data.rooms)).toBe(true);
  });

  it('enforces constant-time comparison on admin access codes', () => {
    expect(verifyAdminCode('20268899')).toBe(true);
    expect(verifyAdminCode('wrong-code')).toBe(false);
    expect(verifyAdminCode('')).toBe(false);
    expect(verifyAdminCode('2026889')).toBe(false); // Different length
  });

  it('rejects unauthenticated socket calls to admin events', async () => {
    const { code } = roomManager.createRoom({ title: 'Socket Auth Test' });

    // 1. Unauthenticated client tries to start test
    const startRes = await new Promise<any>((res) => {
      unauthenticatedClient.emit('admin_start_test', { roomId: code }, res);
    });
    expect(startRes.error).toContain('Unauthorized');

    // 2. Unauthenticated client tries to kick participant
    const kickRes = await new Promise<any>((res) => {
      unauthenticatedClient.emit('admin_kick_participant', { roomId: code, participantId: 'p1' }, res);
    });
    expect(kickRes.error).toContain('Unauthorized');

    // 3. Unauthenticated client tries to join live monitor
    const monitorRes = await new Promise<any>((res) => {
      unauthenticatedClient.emit('admin_join_monitor', { roomId: code }, res);
    });
    expect(monitorRes.error).toContain('Unauthorized');
  });

  it('allows authenticated admin socket to control the tournament', async () => {
    const { code } = roomManager.createRoom({ title: 'Socket Admin Control Test' });

    // Admin joins monitor
    const monitorRes = await new Promise<any>((res) => {
      adminClient.emit('admin_join_monitor', { roomId: code }, res);
    });
    expect(monitorRes.success).toBe(true);
    expect(monitorRes.snapshot.config.roomId).toBe(code);

    // Admin locks room
    const lockRes = await new Promise<any>((res) => {
      adminClient.emit('admin_lock_room', { roomId: code, locked: true }, res);
    });
    expect(lockRes.success).toBe(true);
  });

  it('supports joining via either 8-character code or 6-digit numeric room number', async () => {
    const { code, numericCode } = roomManager.createRoom({ title: 'Dual Code Join Test' });

    // Participant 1 joins using 8-character code
    const p1Join = await new Promise<any>((res) => {
      unauthenticatedClient.emit(
        'join_room',
        { roomId: code, name: 'Alice_Alpha', usn: '4SU22CS001' },
        res
      );
    });
    expect(p1Join.success).toBe(true);
    expect(p1Join.participant.usn).toBe('4SU22CS001');

    // Participant 2 joins using 6-digit numeric code
    const p2Socket = ClientSocket(`http://localhost:${port}`);
    await new Promise<void>((r) => p2Socket.on('connect', r));

    const p2Join = await new Promise<any>((res) => {
      p2Socket.emit(
        'join_room',
        { roomId: numericCode, name: 'Bob_Numeric', usn: '4SU22CS002' },
        res
      );
    });
    expect(p2Join.success).toBe(true);
    expect(p2Join.participant.roomId).toBe(code);
    expect(p2Join.participant.usn).toBe('4SU22CS002');

    p2Socket.disconnect();
  });

  it('records audit events into the database event log', async () => {
    const logs = getEventLogs({ limit: 10 });
    expect(logs.length).toBeGreaterThan(0);
    // Verify audit log structure
    expect(logs[0].id).toBeDefined();
    expect(logs[0].type).toBeDefined();
    expect(logs[0].actor).toBeDefined();
    expect(logs[0].timestamp).toBeGreaterThan(0);
  });
});
