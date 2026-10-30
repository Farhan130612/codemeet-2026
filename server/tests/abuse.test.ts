import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { createIsolatedTestServer } from './testServer.js';
import { roomManager } from '../src/roomManager.js';

describe('Anti-Abuse and Security Validation Tests', () => {
  let port: number;
  let closeServer: () => Promise<void>;
  let client: ClientSocketType;

  beforeAll(async () => {
    const testServer = await createIsolatedTestServer();
    port = testServer.port;
    closeServer = testServer.close;

    client = ClientSocket(`http://localhost:${port}`);
    await new Promise<void>((resolve) => client.on('connect', resolve));
  });

  afterAll(async () => {
    if (client) {
      client.disconnect();
    }
    if (closeServer) {
      await closeServer();
    }
  });

  it('rejects duplicate participant display names in the same room', async () => {
    const { code } = roomManager.createRoom({ title: 'Duplicate Name Test' });

    // Join first participant with name "SpeedDemon"
    const join1 = await new Promise<any>((resolve) => {
      client.emit('join_room', { roomId: code, name: 'SpeedDemon' }, resolve);
    });
    expect(join1.success).toBe(true);

    // Attempt to join second participant with same name (case-insensitive "speeddemon")
    const client2 = ClientSocket(`http://localhost:${port}`);
    await new Promise<void>((resolve) => client2.on('connect', resolve));

    const join2 = await new Promise<any>((resolve) => {
      client2.emit('join_room', { roomId: code, name: 'speeddemon' }, resolve);
    });
    expect(join2.error).toContain('already taken');

    client2.disconnect();
  });

  it('prevents joining a room after the host locks it', async () => {
    const { code, hostToken } = roomManager.createRoom({ title: 'Lock Test' });

    // Host locks room
    const lockRes = await new Promise<any>((resolve) => {
      client.emit('host_lock', { roomId: code, hostToken, locked: true }, resolve);
    });
    expect(lockRes.success).toBe(true);

    // Participant tries to join locked room
    const joinRes = await new Promise<any>((resolve) => {
      client.emit('join_room', { roomId: code, name: 'LateComer' }, resolve);
    });
    expect(joinRes.error).toContain('locked by the host');
  });

  it('ignores client-sent WPM and computes server-authoritative score', async () => {
    const { code, hostToken } = roomManager.createRoom({
      title: 'Tamper Test',
      timerSeconds: 30,
    });

    const join = await new Promise<any>((resolve) => {
      client.emit('join_room', { roomId: code, name: 'HackerJoe' }, resolve);
    });
    const pId = join.participant.id;

    // Start test
    await new Promise<any>((resolve) => {
      client.emit('host_start', { roomId: code, hostToken }, resolve);
    });

    // Client maliciously sends fake clientWpm = 250 with only 3 actual typed characters!
    const res = await new Promise<any>((resolve) => {
      client.emit(
        'submit_keystrokes',
        {
          roomId: code,
          participantId: pId,
          targetTextId: 'test-id',
          clientWpm: 250, // FAKE CLAIM!
          keystrokes: [
            { key: 'a', timestamp: 0, type: 'keydown' },
            { key: 'b', timestamp: 120, type: 'keydown' },
            { key: 'c', timestamp: 240, type: 'keydown' },
          ],
          clientElapsedMs: 240,
        },
        resolve
      );
    });

    expect(res.success).toBe(true);
    // Server computes Net WPM from actual characters, completely ignoring fake clientWpm
    expect(res.result.netWpm).toBeLessThan(10);
    expect(res.result.netWpm).not.toBe(250);
  });

  it('disqualifies paste injection attempts', async () => {
    const { code, hostToken } = roomManager.createRoom({
      title: 'Paste Anti-Cheat Test',
      timerSeconds: 30,
    });

    const join = await new Promise<any>((resolve) => {
      client.emit('join_room', { roomId: code, name: 'Paster' }, resolve);
    });
    const pId = join.participant.id;

    // Start test
    await new Promise<any>((resolve) => {
      client.emit('host_start', { roomId: code, hostToken }, resolve);
    });

    const res = await new Promise<any>((resolve) => {
      client.emit(
        'submit_keystrokes',
        {
          roomId: code,
          participantId: pId,
          targetTextId: 'test-id',
          keystrokes: [
            { key: 'T', timestamp: 0, type: 'keydown' },
            { key: 'he quick brown fox jumps over the lazy dog', timestamp: 50, type: 'paste' },
          ],
          clientElapsedMs: 50,
        },
        resolve
      );
    });

    expect(res.success).toBe(true);
    expect(res.result.isDisqualified).toBe(true);
    expect(res.result.reviewReasons.some((r: string) => r.includes('paste'))).toBe(true);
  });
});
