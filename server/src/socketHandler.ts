import { Server, Socket } from 'socket.io';
import { roomManager } from './roomManager.js';
import { SubmissionPayload } from './types.js';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from './auth.js';
import { logEvent } from './db.js';

function parseCookie(cookieStr: string | undefined, name: string): string | undefined {
  if (!cookieStr) return undefined;
  const match = cookieStr.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function checkSocketAdminAuth(socket: Socket): boolean {
  // Check handshake auth token or cookie
  const authToken = socket.handshake.auth?.token;
  if (authToken && verifyAdminSession(authToken)) {
    return true;
  }
  const cookieStr = socket.handshake.headers.cookie;
  const cookieToken = parseCookie(cookieStr, ADMIN_COOKIE_NAME);
  if (cookieToken && verifyAdminSession(cookieToken)) {
    return true;
  }
  return false;
}

export function setupSocketHandlers(io: Server): void {
  // 2Hz Batched State Broadcaster (Max 2 updates per second per room)
  setInterval(() => {
    // @ts-ignore private access or public method
    for (const [code, liveRoom] of (roomManager as any).rooms.entries()) {
      if (liveRoom.isDirty) {
        liveRoom.isDirty = false;
        const snapshot = roomManager.getSnapshot(code);
        if (snapshot) {
          // Public room update (participants do not receive keystrokes/flag internals)
          io.to(`room:${code}`).emit('room_update', snapshot);
          io.to(`projector:${code}`).emit('projector_update', snapshot);

          // Admin monitor channel gets live room update
          io.to(`admin:monitor:${code}`).emit('admin_monitor_update', {
            snapshot,
            participants: Array.from(liveRoom.participants.values()),
            submissions: Array.from(liveRoom.submissions.values()),
          });
        }
      }
    }
  }, 500);

  io.on('connection', (socket: Socket) => {
    const clientIp = socket.handshake.address;

    // 1. Participant Join Room (with Name + USN)
    socket.on('join_room', (data: {
      roomId: string;
      name: string;
      usn?: string;
      participantId?: string;
    }, callback?: (res: any) => void) => {
      const { roomId, name, usn = '', participantId } = data || {};
      if (!roomId || !name) {
        if (callback) callback({ error: 'Room code/number and display name are required.' });
        return;
      }

      const room = roomManager.getRoom(roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found. Check the code or 6-digit room number.' });
        return;
      }

      const result = roomManager.joinParticipant(
        room.config.roomId,
        socket.id,
        name,
        usn,
        participantId,
        false,
        clientIp
      );

      if (result.error) {
        if (callback) callback({ error: result.error });
        return;
      }

      socket.join(`room:${room.config.roomId}`);
      const snapshot = roomManager.getSnapshot(room.config.roomId);

      if (callback) {
        callback({
          success: true,
          participant: result.participant,
          snapshot,
        });
      }

      io.to(`room:${room.config.roomId}`).emit('room_update', snapshot);
    });

    // 2. Projector Join (Auditorium Scoreboard View)
    socket.on('join_projector', (data: { roomId: string }, callback?: (res: any) => void) => {
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const snapshot = roomManager.getSnapshot(room.config.roomId);
      socket.join(`projector:${room.config.roomId}`);
      if (callback) callback({ success: true, snapshot });
    });

    // 3. Participant Ready Toggle
    socket.on('toggle_ready', (data: {
      roomId: string;
      participantId: string;
      isReady: boolean;
    }) => {
      if (!data?.roomId || !data?.participantId) return;
      const room = roomManager.getRoom(data.roomId);
      if (room) {
        roomManager.setParticipantReady(room.config.roomId, data.participantId, data.isReady);
      }
    });

    // 4. Throttled Participant Heartbeat (Progress & WPM estimate)
    socket.on('heartbeat_progress', (data: {
      roomId: string;
      participantId: string;
      progress: number;
      wpmEstimate: number;
    }) => {
      if (!data?.roomId || !data?.participantId) return;
      const room = roomManager.getRoom(data.roomId);
      if (room) {
        roomManager.updateParticipantProgress(
          room.config.roomId,
          data.participantId,
          data.progress,
          data.wpmEstimate
        );
      }
    });

    // 5. Submit Keystrokes (Server-Authoritative Scoring)
    socket.on('submit_keystrokes', (payload: SubmissionPayload, callback?: (res: any) => void) => {
      if (!payload?.roomId || !payload?.participantId) {
        if (callback) callback({ error: 'Invalid submission payload.' });
        return;
      }

      const room = roomManager.getRoom(payload.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      // Use canonical room ID
      const canonicalPayload = { ...payload, roomId: room.config.roomId };
      const res = roomManager.submitKeystrokes(canonicalPayload);
      if (res.error) {
        if (callback) callback({ error: res.error });
        return;
      }

      if (callback) {
        callback({ success: true, result: res.result });
      }

      const snapshot = roomManager.getSnapshot(room.config.roomId);
      io.to(`room:${room.config.roomId}`).emit('leaderboard_update', snapshot?.leaderboard);
      io.to(`projector:${room.config.roomId}`).emit('leaderboard_update', snapshot?.leaderboard);
    });

    // ==========================================
    // ADMIN ONLY EVENTS (Strict Server Verification)
    // ==========================================

    // Join Admin Live Monitor
    socket.on('admin_join_monitor', (data: { roomId: string }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }

      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      socket.join(`admin:monitor:${room.config.roomId}`);
      const snapshot = roomManager.getSnapshot(room.config.roomId);

      if (callback) {
        callback({
          success: true,
          snapshot,
          participants: Array.from(room.participants.values()),
          submissions: Array.from(room.submissions.values()),
        });
      }
    });

    // Admin: Start Test for Everyone (3-2-1 Countdown)
    socket.on('admin_start_test', (data: { roomId: string }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }

      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const res = roomManager.startTestForEveryone(room.config.roomId);
      if (!res.success) {
        if (callback) callback({ error: res.error });
        return;
      }

      const snapshot = roomManager.getSnapshot(room.config.roomId);
      io.to(`room:${room.config.roomId}`).emit('test_started', {
        countdownEndsAt: snapshot?.countdownEndsAt,
        testEndsAt: snapshot?.testEndsAt,
        targetText: snapshot?.targetText,
        targetTextId: snapshot?.targetTextId,
      });

      if (callback) callback({ success: true });
    });

    // Admin: Abort Run
    socket.on('admin_abort_run', (data: { roomId: string }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const success = roomManager.abortRun(room.config.roomId);
      if (callback) callback({ success });
      if (success) {
        io.to(`room:${room.config.roomId}`).emit('run_aborted');
      }
    });

    // Admin: Pause Lobby
    socket.on('admin_pause_lobby', (data: { roomId: string; paused: boolean }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const success = roomManager.pauseLobby(room.config.roomId, Boolean(data.paused));
      if (callback) callback({ success });
    });

    // Admin: Reset Attempt for single participant
    socket.on('admin_reset_attempt', (data: { roomId: string; participantId: string }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const success = roomManager.resetAttempt(room.config.roomId, data.participantId);
      if (callback) callback({ success });
      if (success) {
        io.to(`room:${room.config.roomId}`).emit('attempt_reset_by_admin', { participantId: data.participantId });
      }
    });

    // Admin: Grant Extra Attempt
    socket.on('admin_grant_attempt', (data: { roomId: string; participantId: string }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const success = roomManager.grantExtraAttempt(room.config.roomId, data.participantId);
      if (callback) callback({ success });
    });

    // Admin: Kick Participant
    socket.on('admin_kick_participant', (data: { roomId: string; participantId: string }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const success = roomManager.kickParticipant(room.config.roomId, data.participantId);
      if (callback) callback({ success });
      if (success) {
        io.to(`room:${room.config.roomId}`).emit('participant_kicked', { participantId: data.participantId });
      }
    });

    // Admin: Ban Participant
    socket.on('admin_ban_participant', (data: { roomId: string; participantId: string; reason?: string }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const success = roomManager.banParticipant(room.config.roomId, data.participantId, data.reason);
      if (callback) callback({ success });
      if (success) {
        io.to(`room:${room.config.roomId}`).emit('participant_kicked', { participantId: data.participantId });
      }
    });

    // Admin: Rename Participant
    socket.on('admin_rename_participant', (data: { roomId: string; participantId: string; newName: string }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const success = roomManager.renameParticipant(room.config.roomId, data.participantId, data.newName);
      if (callback) callback({ success });
    });

    // Admin: Resolve Flag (Accept, Disqualify, Request Retype)
    socket.on('admin_resolve_flag', (data: {
      roomId: string;
      participantId: string;
      decision: 'accept' | 'disqualify' | 'request_retype';
    }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const success = roomManager.resolveFlag(room.config.roomId, data.participantId, data.decision);
      if (callback) callback({ success });
    });

    // Admin: Lock/Unlock Room
    socket.on('admin_lock_room', (data: { roomId: string; locked: boolean }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const success = roomManager.lockRoom(room.config.roomId, data.locked);
      if (callback) callback({ success });
    });

    // Admin: Reset Room for next round
    socket.on('admin_reset_room', (data: { roomId: string }, callback?: (res: any) => void) => {
      if (!checkSocketAdminAuth(socket)) {
        if (callback) callback({ error: 'Unauthorized: Admin authentication required.' });
        return;
      }
      const room = roomManager.getRoom(data?.roomId);
      if (!room) {
        if (callback) callback({ error: 'Room not found.' });
        return;
      }

      const success = roomManager.resetRoom(room.config.roomId);
      if (callback) callback({ success });
      if (success) {
        const snapshot = roomManager.getSnapshot(room.config.roomId);
        io.to(`room:${room.config.roomId}`).emit('room_reset', snapshot);
      }
    });

    // Legacy host events fallback for compatibility
    socket.on('host_lock', (data: { roomId: string; hostToken: string; locked: boolean }, callback?: (res: any) => void) => {
      const room = roomManager.getRoom(data?.roomId);
      if (!room || room.config.hostToken !== data.hostToken) {
        if (callback) callback({ error: 'Unauthorized' });
        return;
      }
      const success = roomManager.lockRoom(room.config.roomId, Boolean(data.locked));
      if (callback) callback({ success });
    });

    socket.on('host_start', (data: { roomId: string; hostToken: string }, callback?: (res: any) => void) => {
      const room = roomManager.getRoom(data?.roomId);
      if (!room || room.config.hostToken !== data.hostToken) {
        if (callback) callback({ error: 'Unauthorized' });
        return;
      }
      const res = roomManager.startTestForEveryone(room.config.roomId, data.hostToken);
      if (callback) callback(res);
      if (res.success) {
        const snapshot = roomManager.getSnapshot(room.config.roomId);
        io.to(`room:${room.config.roomId}`).emit('test_started', {
          countdownEndsAt: snapshot?.countdownEndsAt,
          testEndsAt: snapshot?.testEndsAt,
          targetText: snapshot?.targetText,
          targetTextId: snapshot?.targetTextId,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      roomManager.handleDisconnect(socket.id);
    });
  });
}
