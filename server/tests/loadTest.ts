import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { createIsolatedTestServer } from './testServer.js';
import { roomManager } from '../src/roomManager.js';
import { KeystrokeEvent } from '../src/types.js';
import { createAdminSessionToken } from '../src/auth.js';

interface LatencyRecord {
  connectMs: number;
  joinMs: number;
  startReceiveMs: number;
  submitMs: number;
}

async function runLoadTest(totalParticipants = 120) {
  console.log(`================================================================`);
  console.log(`  CODE MEET 2026: CONCURRENCY & ADMIN MONITOR LOAD TEST`);
  console.log(`  Target: ${totalParticipants} simulated typists + Active Admin Monitor`);
  console.log(`================================================================`);

  const startTime = Date.now();
  const testServer = await createIsolatedTestServer();
  const serverUrl = `http://localhost:${testServer.port}`;

  // 1. Create tournament room
  const { code, numericCode } = roomManager.createRoom({
    title: 'Code Meet 2026 Grand Championship',
    timerSeconds: 15,
    minAccuracy: 90,
    maxParticipants: 160,
  });

  console.log(`[+] Created test room: ${code} (Numeric: ${numericCode})`);

  // 2. Connect Admin to Live Monitor
  const adminToken = createAdminSessionToken();
  const adminSocket = ClientSocket(serverUrl, {
    transports: ['websocket'],
    auth: { token: adminToken },
  });

  await new Promise<void>((resolve) => adminSocket.on('connect', resolve));
  let adminMonitorUpdatesCount = 0;
  adminSocket.on('admin_monitor_update', () => {
    adminMonitorUpdatesCount++;
  });

  await new Promise<void>((resolve) => {
    adminSocket.emit('admin_join_monitor', { roomId: code }, (res: any) => {
      if (res?.success) {
        console.log(`[+] Admin successfully connected to live monitor stream.`);
      }
      resolve();
    });
  });

  // 3. Connect participants concurrently (alternating 8-char code and 6-digit numeric room number)
  const clients: ClientSocketType[] = [];
  const latencies: LatencyRecord[] = [];
  let connectErrors = 0;
  let submitErrors = 0;

  console.log(`[+] Connecting ${totalParticipants} simulated typists with USNs concurrently...`);
  const connectPromises = [];

  for (let i = 0; i < totalParticipants; i++) {
    const pIndex = i + 1;
    const name = `Typist_${String(pIndex).padStart(3, '0')}`;
    const usn = `4SU22CS${String(pIndex).padStart(3, '0')}`;
    const targetRoomId = i % 2 === 0 ? code : numericCode; // Alternate joining method
    const pStart = Date.now();

    const p = new Promise<void>((resolve) => {
      const socket = ClientSocket(serverUrl, {
        transports: ['websocket'],
        reconnection: false,
      });

      const rec: LatencyRecord = {
        connectMs: 0,
        joinMs: 0,
        startReceiveMs: 0,
        submitMs: 0,
      };

      socket.on('connect_error', () => {
        connectErrors++;
        resolve();
      });

      socket.on('connect', () => {
        rec.connectMs = Date.now() - pStart;
        const joinStart = Date.now();

        socket.emit(
          'join_room',
          { roomId: targetRoomId, name, usn },
          (response: any) => {
            rec.joinMs = Date.now() - joinStart;
            if (!response?.success) {
              connectErrors++;
            }
            clients.push(socket);
            latencies.push(rec);
            resolve();
          }
        );
      });
    });

    connectPromises.push(p);
  }

  await Promise.all(connectPromises);
  console.log(`[+] Connected & registered ${clients.length}/${totalParticipants} clients.`);

  // 4. Admin triggers competition start via admin_start_test
  const startTriggerTime = Date.now();
  const startReceivedPromises = clients.map((c, idx) => {
    return new Promise<{ targetText: string; targetTextId: string }>((resolve) => {
      c.on('test_started', (data: any) => {
        latencies[idx].startReceiveMs = Date.now() - startTriggerTime;
        resolve(data);
      });
    });
  });

  console.log(`[+] Admin initiating server-synchronized 3-2-1 countdown...`);
  await new Promise<void>((resolve) => {
    adminSocket.emit('admin_start_test', { roomId: code }, (res: any) => {
      resolve();
    });
  });

  const startDataArray = await Promise.all(startReceivedPromises);
  const sampleTargetText = startDataArray[0].targetText;
  const sampleTextId = startDataArray[0].targetTextId;
  console.log(`[+] All ${clients.length} clients synchronized and received target text.`);

  // 5. Simulate keystrokes, heartbeats and submissions
  console.log(`[+] Emitting 500ms typist heartbeats to admin monitor and calculating submissions...`);
  const submitPromises = clients.map(async (clientSocket, idx) => {
    const pIndex = idx + 1;
    const simulatedWpm = 45 + (pIndex % 70);
    const msPerChar = Math.floor(60000 / (simulatedWpm * 5));

    // Progress heartbeats
    for (let progress = 25; progress <= 75; progress += 25) {
      clientSocket.emit('heartbeat_progress', {
        roomId: code,
        participantId: `participant-${idx}`,
        progress,
        wpmEstimate: simulatedWpm,
      });
    }

    const charsToType = Math.min(sampleTargetText.length, Math.floor((15 * simulatedWpm * 5) / 60));
    let t = 100;
    const keystrokes: KeystrokeEvent[] = [];

    for (let c = 0; c < charsToType; c++) {
      const char = sampleTargetText[c] || 'a';
      const jitter = ((c * 13) % 21) - 10;
      keystrokes.push({
        key: char,
        timestamp: t,
        type: 'keydown',
      });
      t += Math.max(30, msPerChar + jitter);
    }

    // Submit results
    const submitStart = Date.now();
    return new Promise<void>((resolve) => {
      clientSocket.emit(
        'submit_keystrokes',
        {
          roomId: code,
          participantId: (clientSocket as any).id,
          targetTextId: sampleTextId,
          keystrokes,
          clientElapsedMs: t,
        },
        (res: any) => {
          latencies[idx].submitMs = Date.now() - submitStart;
          if (res?.error && !res?.result) {
            submitErrors++;
          }
          resolve();
        }
      );
    });
  });

  await Promise.all(submitPromises);
  const totalDurationMs = Date.now() - startTime;

  // 6. Metrics & Summary
  const connectTimes = latencies.map((l) => l.connectMs).sort((a, b) => a - b);
  const joinTimes = latencies.map((l) => l.joinMs).sort((a, b) => a - b);
  const startRecTimes = latencies.map((l) => l.startReceiveMs).sort((a, b) => a - b);
  const submitTimes = latencies.map((l) => l.submitMs).sort((a, b) => a - b);

  const p50 = (arr: number[]) => arr[Math.floor(arr.length * 0.5)] || 0;
  const p95 = (arr: number[]) => arr[Math.floor(arr.length * 0.95)] || 0;
  const p99 = (arr: number[]) => arr[Math.floor(arr.length * 0.99)] || 0;
  const max = (arr: number[]) => arr[arr.length - 1] || 0;

  console.log(`\n================================================================`);
  console.log(`  LOAD TEST BENCHMARK RESULTS (WITH ACTIVE ADMIN MONITOR)`);
  console.log(`================================================================`);
  console.log(`  Total Connected Clients:  ${clients.length}/${totalParticipants}`);
  console.log(`  Admin Monitor Stream:     ACTIVE (${adminMonitorUpdatesCount} updates received)`);
  console.log(`  Connection Errors:        ${connectErrors}`);
  console.log(`  Total Test Time:          ${(totalDurationMs / 1000).toFixed(2)}s`);
  console.log(`----------------------------------------------------------------`);
  console.log(`  METRIC                     p50 (ms)   p95 (ms)   p99 (ms)   Max (ms)`);
  console.log(`  WebSocket Handshake:       ${String(p50(connectTimes)).padStart(5)}      ${String(p95(connectTimes)).padStart(5)}      ${String(p99(connectTimes)).padStart(5)}      ${String(max(connectTimes)).padStart(5)}`);
  console.log(`  Room Join ACK:             ${String(p50(joinTimes)).padStart(5)}      ${String(p95(joinTimes)).padStart(5)}      ${String(p99(joinTimes)).padStart(5)}      ${String(max(joinTimes)).padStart(5)}`);
  console.log(`  Sync Start Delivery:       ${String(p50(startRecTimes)).padStart(5)}      ${String(p95(startRecTimes)).padStart(5)}      ${String(p99(startRecTimes)).padStart(5)}      ${String(max(startRecTimes)).padStart(5)}`);
  console.log(`  Authoritative Submission:  ${String(p50(submitTimes)).padStart(5)}      ${String(p95(submitTimes)).padStart(5)}      ${String(p99(submitTimes)).padStart(5)}      ${String(max(submitTimes)).padStart(5)}`);
  console.log(`----------------------------------------------------------------`);
  console.log(`  Target p95 Latency (< 200ms): ${p95(submitTimes) < 200 ? 'PASSED (PASS)' : 'FLAGGED'}`);
  console.log(`================================================================\n`);

  clients.forEach((c) => c.disconnect());
  adminSocket.disconnect();
  await testServer.close();

  if (connectErrors === 0 && p95(submitTimes) < 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runLoadTest(120).catch((err) => {
  console.error('Load test error:', err);
  process.exit(1);
});
