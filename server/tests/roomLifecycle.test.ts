import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { createIsolatedTestServer } from './testServer.js';
import { RoomSnapshot } from '../src/types.js';
import { createAdminSessionToken } from '../src/auth.js';

describe('Room Lifecycle Integration Tests', () => {
  let port: number;
  let closeServer: () => Promise<void>;

  beforeAll(async () => {
    const testServer = await createIsolatedTestServer();
    port = testServer.port;
    closeServer = testServer.close;
  });

  afterAll(async () => {
    if (closeServer) {
      await closeServer();
    }
  });

  it('completes the full competition lifecycle: create, join, start, submit, leaderboard', async () => {
    // 1. Create Room via Protected Admin REST API
    const adminToken = createAdminSessionToken();
    const res = await fetch(`http://localhost:${port}/api/admin/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'College Championship Test',
        timerSeconds: 30,
        minAccuracy: 90,
      }),
    });

    const createData = (await res.json()) as any;
    expect(res.status).toBe(201);
    expect(createData.success).toBe(true);
    expect(createData.code).toHaveLength(8);
    expect(createData.numericCode).toHaveLength(6);
    const roomId = createData.code;
    const hostToken = createData.hostToken;

    // 2. Join 2 Participants via WebSockets
    const client1: ClientSocketType = ClientSocket(`http://localhost:${port}`);
    const client2: ClientSocketType = ClientSocket(`http://localhost:${port}`);

    await Promise.all([
      new Promise<void>((resolve) => client1.on('connect', resolve)),
      new Promise<void>((resolve) => client2.on('connect', resolve)),
    ]);

    // Participant 1 joins
    const join1 = await new Promise<any>((resolve) => {
      client1.emit(
        'join_room',
        { roomId, name: 'Alice_Racer' },
        (response: any) => resolve(response)
      );
    });
    expect(join1.success).toBe(true);
    expect(join1.participant.name).toBe('Alice_Racer');
    const p1Id = join1.participant.id;

    // Participant 2 joins
    const join2 = await new Promise<any>((resolve) => {
      client2.emit(
        'join_room',
        { roomId, name: 'Bob_Typer' },
        (response: any) => resolve(response)
      );
    });
    expect(join2.success).toBe(true);
    const p2Id = join2.participant.id;

    // 3. Verify target text is NOT leaked in the lobby before start
    const lobbySnapshot = await fetch(`http://localhost:${port}/api/rooms/${roomId}`).then((r) =>
      r.json()
    ) as RoomSnapshot;
    expect(lobbySnapshot.targetText).toBeUndefined();
    expect(lobbySnapshot.state).toBe('lobby');

    // 4. Host starts the test
    const startRes = await new Promise<any>((resolve) => {
      client1.emit('host_start', { roomId, hostToken }, resolve);
    });
    expect(startRes.success).toBe(true);

    // 5. Participants receive the target text ONLY upon test start
    const startPayload = await new Promise<any>((resolve) => {
      client2.on('test_started', resolve);
    });
    expect(startPayload.targetText).toBeDefined();
    expect(startPayload.targetText.length).toBeGreaterThan(20);
    const targetText = startPayload.targetText;

    // 6. Alice types accurately with human timing jitter
    const targetChars = targetText.slice(0, 30).split('');
    let t = 0;
    const aliceKeystrokes = targetChars.map((ch: string, i: number) => {
      const k = { key: ch, timestamp: t, type: 'keydown' as const };
      t += 110 + ((i % 5) - 2) * 18;
      return k;
    });

    const aliceSubmit = await new Promise<any>((resolve) => {
      client1.emit(
        'submit_keystrokes',
        {
          roomId,
          participantId: p1Id,
          targetTextId: startPayload.targetTextId,
          keystrokes: aliceKeystrokes,
          clientElapsedMs: t,
        },
        resolve
      );
    });
    expect(aliceSubmit.success).toBe(true);
    expect(aliceSubmit.result.netWpm).toBeGreaterThan(0);
    expect(aliceSubmit.result.isDisqualified).toBe(false);

    // 7. Verify CSV Export
    const csvRes = await fetch(`http://localhost:${port}/api/rooms/${roomId}/export.csv`);
    const csvText = await csvRes.text();
    expect(csvText).toContain('Alice_Racer');
    expect(csvText).toContain('QUALIFIED');

    client1.disconnect();
    client2.disconnect();
  });
});
