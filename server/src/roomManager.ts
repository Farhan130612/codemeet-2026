import crypto from 'crypto';
import {
  RoomConfig,
  Participant,
  RoomSnapshot,
  RoomState,
  ScoringResult,
  SubmissionPayload,
} from './types.js';
import { selectTargetText, TextEntry } from './textBank.js';
import { calculateAuthoritativeScore, rankLeaderboard } from './scoring.js';
import {
  saveRoomToDb,
  updateRoomStateInDb,
  saveParticipantToDb,
  saveAttemptToDb,
  getRoomAttemptsFromDb,
  logEvent,
  banParticipant,
  isParticipantBanned,
  db,
} from './db.js';

// Unambiguous character set for 8-char room codes (no 0/O, 1/I/l)
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRoomCode(): string {
  const bytes = crypto.randomBytes(8);
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return result;
}

function generateNumericCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export interface LiveRoom {
  config: RoomConfig;
  state: RoomState;
  targetTextEntry?: TextEntry;
  countdownEndsAt?: number;
  testEndsAt?: number;
  locked: boolean;
  paused: boolean;
  participants: Map<string, Participant>; // participantId -> Participant
  submissions: Map<string, ScoringResult>; // participantId -> ScoringResult
  isDirty: boolean; // Flag for 2Hz batched broadcast
}

export class RoomManager {
  private rooms: Map<string, LiveRoom> = new Map(); // 8-char code -> LiveRoom
  private numericIndex: Map<string, string> = new Map(); // 6-digit numeric -> 8-char code

  constructor() {
    // Restore existing rooms from database on server startup
    this.restoreRoomsFromDb();

    // Periodic sweep for expired rooms
    setInterval(() => {
      this.cleanupExpiredRooms();
    }, 60 * 60 * 1000);
  }

  private restoreRoomsFromDb(): void {
    try {
      const rows = db.prepare('SELECT * FROM rooms WHERE expires_at > ?').all(Date.now()) as any[];
      for (const r of rows) {
        const config: RoomConfig = {
          roomId: r.room_id,
          numericCode: r.numeric_code || r.room_id.slice(0, 6),
          title: r.title,
          hostToken: r.host_token,
          language: r.language,
          timerSeconds: r.timer_seconds,
          attemptsPerParticipant: r.attempts_per_participant,
          minAccuracy: r.min_accuracy,
          maxParticipants: r.max_participants,
          isPrivate: Boolean(r.is_private),
          backspaceMode: r.backspace_mode,
          hasPunctuation: Boolean(r.has_punctuation),
          hasNumbers: Boolean(r.has_numbers),
          scheduledStartTime: r.scheduled_start_time || undefined,
        };

        const liveRoom: LiveRoom = {
          config,
          state: (r.state as RoomState) || 'lobby',
          locked: false,
          paused: false,
          participants: new Map(),
          submissions: new Map(),
          isDirty: true,
        };

        this.rooms.set(config.roomId, liveRoom);
        if (config.numericCode) {
          this.numericIndex.set(config.numericCode, config.roomId);
        }

        // Restore submissions
        const submissions = getRoomAttemptsFromDb(config.roomId);
        for (const sub of submissions) {
          liveRoom.submissions.set(sub.participantId, sub);
        }
      }
    } catch (e) {
      console.error('Error restoring rooms from DB:', e);
    }
  }

  public createRoom(params: {
    title?: string;
    language?: string;
    timerSeconds?: number;
    attemptsPerParticipant?: number;
    minAccuracy?: number;
    maxParticipants?: number;
    isPrivate?: boolean;
    backspaceMode?: 'all' | 'word' | 'none';
    hasPunctuation?: boolean;
    hasNumbers?: boolean;
    scheduledStartTime?: number;
  }): { room: LiveRoom; hostToken: string; code: string; numericCode: string } {
    let code = generateRoomCode();
    while (this.rooms.has(code)) {
      code = generateRoomCode();
    }

    let numericCode = generateNumericCode();
    while (this.numericIndex.has(numericCode)) {
      numericCode = generateNumericCode();
    }

    const hostToken = crypto.randomBytes(24).toString('hex');

    const config: RoomConfig = {
      roomId: code,
      numericCode,
      title: params.title?.trim() || 'Code Meet 2026 Speed Typer',
      hostToken,
      language: params.language || 'en',
      timerSeconds: params.timerSeconds || 60,
      attemptsPerParticipant: params.attemptsPerParticipant || 1,
      minAccuracy: params.minAccuracy !== undefined ? params.minAccuracy : 90,
      maxParticipants: params.maxParticipants || 150,
      isPrivate: Boolean(params.isPrivate),
      backspaceMode: params.backspaceMode || 'all',
      hasPunctuation: params.hasPunctuation !== undefined ? params.hasPunctuation : true,
      hasNumbers: params.hasNumbers !== undefined ? params.hasNumbers : false,
      scheduledStartTime: params.scheduledStartTime,
    };

    const liveRoom: LiveRoom = {
      config,
      state: 'lobby',
      locked: false,
      paused: false,
      participants: new Map(),
      submissions: new Map(),
      isDirty: true,
    };

    this.rooms.set(code, liveRoom);
    this.numericIndex.set(numericCode, code);
    saveRoomToDb(config);

    logEvent({
      roomId: code,
      type: 'room_created',
      severity: 'info',
      actor: 'admin',
      message: `Room "${config.title}" created. Code: ${code}, Number: ${numericCode}`,
      details: { code, numericCode, config },
    });

    return { room: liveRoom, hostToken, code, numericCode };
  }

  /**
   * Resolves room by either 8-character code (e.g. K9X2M4R7) or 6-digit numeric room number (e.g. 482910)
   */
  public getRoom(identifier: string): LiveRoom | undefined {
    if (!identifier) return undefined;
    const clean = identifier.toUpperCase().trim();

    // Check direct 8-char code
    if (this.rooms.has(clean)) {
      return this.rooms.get(clean);
    }

    // Check 6-digit numeric code
    if (this.numericIndex.has(clean)) {
      const actualCode = this.numericIndex.get(clean)!;
      return this.rooms.get(actualCode);
    }

    // Fallback DB lookup for persisted rooms
    try {
      const row = db
        .prepare('SELECT * FROM rooms WHERE (room_id = ? OR numeric_code = ?) AND expires_at > ?')
        .get(clean, clean, Date.now()) as any;
      if (row) {
        this.restoreRoomsFromDb();
        return this.rooms.get(row.room_id);
      }
    } catch {}

    return undefined;
  }

  public validateHost(roomId: string, hostToken: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;
    return room.config.hostToken === hostToken;
  }

  public joinParticipant(
    roomId: string,
    socketId: string,
    name: string,
    usn: string = '',
    existingParticipantId?: string,
    isHost = false,
    ip?: string
  ): { participant: Participant; error?: string } {
    const room = this.getRoom(roomId);
    if (!room) {
      return { participant: null as any, error: 'Room not found. Check code or room number.' };
    }

    const sanitizedName = name.trim().slice(0, 24);
    if (sanitizedName.length < 2) {
      return { participant: null as any, error: 'Display name must be at least 2 characters.' };
    }

    const sanitizedUsn = (usn || '').trim().toUpperCase().slice(0, 20);

    // Check if participant or IP is banned from this room
    if (isParticipantBanned(room.config.roomId, sanitizedName, sanitizedUsn, ip)) {
      logEvent({
        roomId: room.config.roomId,
        type: 'banned_join_rejected',
        severity: 'warn',
        actor: sanitizedName,
        message: `Banned participant tried to join: ${sanitizedName} (USN: ${sanitizedUsn})`,
      });
      return { participant: null as any, error: 'You are banned from participating in this room.' };
    }

    // Check reconnecting participant
    if (existingParticipantId && room.participants.has(existingParticipantId)) {
      const existing = room.participants.get(existingParticipantId)!;
      existing.socketId = socketId;
      existing.status = existing.status === 'disconnected' ? 'joined' : existing.status;
      existing.lastActiveAt = Date.now();
      if (sanitizedUsn && !existing.usn) {
        existing.usn = sanitizedUsn;
      }
      room.isDirty = true;

      logEvent({
        roomId: room.config.roomId,
        type: 'participant_reconnected',
        actor: existing.name,
        message: `${existing.name} (USN: ${existing.usn}) reconnected.`,
      });

      return { participant: existing };
    }

    if (room.locked && !isHost) {
      return { participant: null as any, error: 'This room has been locked by the host.' };
    }

    if (room.paused && !isHost) {
      return { participant: null as any, error: 'Lobby is currently paused by admin.' };
    }

    if (room.participants.size >= room.config.maxParticipants) {
      return { participant: null as any, error: 'Room capacity reached (150 max).' };
    }

    // Name uniqueness check within room (case-insensitive)
    for (const p of room.participants.values()) {
      if (p.name.toLowerCase() === sanitizedName.toLowerCase()) {
        return { participant: null as any, error: 'Display name is already taken in this room.' };
      }
      if (sanitizedUsn && p.usn && p.usn.toLowerCase() === sanitizedUsn.toLowerCase()) {
        return { participant: null as any, error: `USN "${sanitizedUsn}" is already registered in this room.` };
      }
    }

    const participantId = existingParticipantId || crypto.randomUUID();
    const participant: Participant = {
      id: participantId,
      socketId,
      name: sanitizedName,
      usn: sanitizedUsn,
      roomId: room.config.roomId,
      isHost,
      status: 'joined',
      attemptsUsed: 0,
      joinedAt: Date.now(),
      lastActiveAt: Date.now(),
      progress: 0,
      currentWpmEstimate: 0,
      connectionQuality: 'good',
    };

    room.participants.set(participantId, participant);
    saveParticipantToDb(participant);
    room.isDirty = true;

    logEvent({
      roomId: room.config.roomId,
      type: 'participant_joined',
      actor: sanitizedName,
      message: `${sanitizedName} (USN: ${sanitizedUsn || 'N/A'}) joined room.`,
    });

    return { participant };
  }

  public setParticipantReady(roomId: string, participantId: string, isReady: boolean): boolean {
    const room = this.getRoom(roomId);
    if (!room || room.state !== 'lobby') return false;

    const p = room.participants.get(participantId);
    if (!p) return false;

    p.status = isReady ? 'ready' : 'joined';
    p.lastActiveAt = Date.now();
    room.isDirty = true;
    return true;
  }

  public startTestForEveryone(roomId: string, hostToken?: string): { success: boolean; error?: string } {
    const room = this.getRoom(roomId);
    if (!room) return { success: false, error: 'Room not found.' };
    if (hostToken && room.config.hostToken !== hostToken) {
      return { success: false, error: 'Unauthorized host token.' };
    }
    if (room.state !== 'lobby') {
      return { success: false, error: `Cannot start test from state "${room.state}".` };
    }

    // Select target text now (NEVER exposed before start)
    const minWords = Math.max(50, Math.ceil((room.config.timerSeconds / 60) * 80));
    const textEntry = selectTargetText({
      hasPunctuation: room.config.hasPunctuation,
      hasNumbers: room.config.hasNumbers,
      minWords,
    });
    room.targetTextEntry = textEntry;

    // Synced timestamps: 3-second countdown
    const now = Date.now();
    const countdownDurationMs = 3000;
    room.state = 'countdown';
    room.countdownEndsAt = now + countdownDurationMs;
    room.testEndsAt = room.countdownEndsAt + room.config.timerSeconds * 1000;

    for (const p of room.participants.values()) {
      if (p.status !== 'disconnected' && p.status !== 'removed') {
        p.status = 'typing';
        p.progress = 0;
        p.currentWpmEstimate = 0;
      }
    }

    updateRoomStateInDb(room.config.roomId, 'countdown', textEntry.id, textEntry.text);
    room.isDirty = true;

    logEvent({
      roomId: room.config.roomId,
      type: 'test_started',
      severity: 'info',
      actor: 'admin',
      message: `Test started for ${room.participants.size} participants. Timer: ${room.config.timerSeconds}s.`,
    });

    // Auto-transition to in_progress after countdown ends
    setTimeout(() => {
      if (room.state === 'countdown') {
        room.state = 'in_progress';
        updateRoomStateInDb(room.config.roomId, 'in_progress');
        room.isDirty = true;
      }
    }, countdownDurationMs);

    // Auto-transition to ended when time expires
    setTimeout(() => {
      if (room.state === 'in_progress') {
        room.state = 'ended';
        updateRoomStateInDb(room.config.roomId, 'ended');
        room.isDirty = true;
        logEvent({
          roomId: room.config.roomId,
          type: 'test_concluded',
          actor: 'system',
          message: `Timer expired. Test round concluded.`,
        });
      }
    }, countdownDurationMs + room.config.timerSeconds * 1000 + 1500);

    return { success: true };
  }

  public abortRun(roomId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.state = 'lobby';
    room.countdownEndsAt = undefined;
    room.testEndsAt = undefined;

    for (const p of room.participants.values()) {
      if (p.status === 'typing') {
        p.status = 'joined';
        p.progress = 0;
      }
    }

    updateRoomStateInDb(room.config.roomId, 'lobby');
    room.isDirty = true;

    logEvent({
      roomId: room.config.roomId,
      type: 'test_aborted',
      severity: 'warn',
      actor: 'admin',
      message: 'Active run aborted by admin. Room reverted to lobby.',
    });

    return true;
  }

  public updateParticipantProgress(
    roomId: string,
    participantId: string,
    progress: number,
    wpmEstimate: number
  ): void {
    const room = this.getRoom(roomId);
    if (!room || (room.state !== 'in_progress' && room.state !== 'countdown')) return;

    const p = room.participants.get(participantId);
    if (p) {
      p.progress = Math.max(0, Math.min(100, Math.round(progress)));
      p.currentWpmEstimate = Math.max(0, Math.round(wpmEstimate));
      p.lastActiveAt = Date.now();
      room.isDirty = true;
    }
  }

  public submitKeystrokes(payload: SubmissionPayload): {
    result: ScoringResult | null;
    error?: string;
  } {
    const { roomId, participantId, keystrokes } = payload;
    const room = this.getRoom(roomId);
    if (!room) return { result: null, error: 'Room not found.' };

    const participant = room.participants.get(participantId);
    if (!participant) return { result: null, error: 'Participant not in room.' };

    if (participant.attemptsUsed >= room.config.attemptsPerParticipant) {
      const existing = room.submissions.get(participantId);
      if (existing) return { result: existing };
      return { result: null, error: 'Max attempts already used for this round.' };
    }

    if (!room.targetTextEntry || !room.targetTextEntry.text) {
      return { result: null, error: 'No active target text for this test.' };
    }

    // Authoritative score calculation
    const result = calculateAuthoritativeScore({
      participantId,
      participantName: participant.name,
      usn: participant.usn,
      targetText: room.targetTextEntry.text,
      keystrokes,
      timerSeconds: room.config.timerSeconds,
      minAccuracy: room.config.minAccuracy,
      submittedAt: Date.now(),
    });

    participant.attemptsUsed += 1;
    participant.status = result.flaggedForReview ? 'flagged' : 'finished';
    participant.progress = 100;
    participant.currentWpmEstimate = result.netWpm;

    room.submissions.set(participantId, result);
    saveAttemptToDb(room.config.roomId, result);
    saveParticipantToDb(participant);

    room.isDirty = true;

    if (result.flaggedForReview) {
      logEvent({
        roomId: room.config.roomId,
        type: 'flag_raised',
        severity: 'warn',
        actor: participant.name,
        message: `Anti-cheat flagged submission by ${participant.name}: ${result.reviewReasons.join('; ')}`,
        details: { reasons: result.reviewReasons, netWpm: result.netWpm, accuracy: result.accuracy },
      });
    } else {
      logEvent({
        roomId: room.config.roomId,
        type: 'attempt_submitted',
        actor: participant.name,
        message: `${participant.name} submitted: ${result.netWpm} Net WPM, ${result.accuracy}% Acc.`,
      });
    }

    return { result };
  }

  public getLeaderboard(roomId: string): ScoringResult[] {
    const room = this.getRoom(roomId);
    if (!room) {
      return getRoomAttemptsFromDb(roomId);
    }
    const results = Array.from(room.submissions.values());
    return rankLeaderboard(results);
  }

  public kickParticipant(roomId: string, participantId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const p = room.participants.get(participantId);
    if (p) {
      p.status = 'removed';
      room.participants.delete(participantId);
      room.submissions.delete(participantId);
      room.isDirty = true;

      logEvent({
        roomId: room.config.roomId,
        type: 'participant_removed',
        severity: 'warn',
        actor: 'admin',
        message: `Participant "${p.name}" (USN: ${p.usn}) was removed from room.`,
      });

      return true;
    }
    return false;
  }

  public banParticipant(roomId: string, participantId: string, reason?: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const p = room.participants.get(participantId);
    if (p) {
      banParticipant(room.config.roomId, p.name, p.usn, undefined, reason);
      return this.kickParticipant(roomId, participantId);
    }
    return false;
  }

  public renameParticipant(roomId: string, participantId: string, newName: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const p = room.participants.get(participantId);
    if (p) {
      const old = p.name;
      p.name = newName.trim().slice(0, 24);
      saveParticipantToDb(p);
      room.isDirty = true;

      logEvent({
        roomId: room.config.roomId,
        type: 'participant_renamed',
        actor: 'admin',
        message: `Participant renamed: "${old}" -> "${p.name}".`,
      });
      return true;
    }
    return false;
  }

  public resetAttempt(roomId: string, participantId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const p = room.participants.get(participantId);
    if (p) {
      p.attemptsUsed = Math.max(0, p.attemptsUsed - 1);
      p.status = 'joined';
      p.progress = 0;
      room.submissions.delete(participantId);
      room.isDirty = true;

      logEvent({
        roomId: room.config.roomId,
        type: 'attempt_reset',
        actor: 'admin',
        message: `Attempt reset for "${p.name}". Can now re-take test.`,
      });
      return true;
    }
    return false;
  }

  public grantExtraAttempt(roomId: string, participantId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const p = room.participants.get(participantId);
    if (p) {
      p.attemptsUsed = Math.max(0, p.attemptsUsed - 1);
      p.status = 'joined';
      room.isDirty = true;

      logEvent({
        roomId: room.config.roomId,
        type: 'extra_attempt_granted',
        actor: 'admin',
        message: `Extra attempt granted to "${p.name}".`,
      });
      return true;
    }
    return false;
  }

  public resolveFlag(
    roomId: string,
    participantId: string,
    decision: 'accept' | 'disqualify' | 'request_retype'
  ): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const sub = room.submissions.get(participantId);
    const p = room.participants.get(participantId);
    if (!sub || !p) return false;

    if (decision === 'accept') {
      sub.flaggedForReview = false;
      p.status = 'finished';
      logEvent({
        roomId: room.config.roomId,
        type: 'flag_resolved',
        actor: 'admin',
        message: `Flag resolved: Accepted score for "${p.name}".`,
      });
    } else if (decision === 'disqualify') {
      sub.isDisqualified = true;
      sub.disqualificationReason = 'Disqualified after admin review of suspicious activity.';
      p.status = 'finished';
      logEvent({
        roomId: room.config.roomId,
        type: 'flag_resolved',
        severity: 'warn',
        actor: 'admin',
        message: `Flag resolved: Disqualified "${p.name}".`,
      });
    } else if (decision === 'request_retype') {
      return this.resetAttempt(roomId, participantId);
    }

    saveAttemptToDb(room.config.roomId, sub);
    room.isDirty = true;
    return true;
  }

  public lockRoom(roomId: string, locked: boolean): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.locked = locked;
    room.isDirty = true;

    logEvent({
      roomId: room.config.roomId,
      type: locked ? 'room_locked' : 'room_unlocked',
      actor: 'admin',
      message: locked ? 'Room locked to new participants.' : 'Room unlocked.',
    });

    return true;
  }

  public pauseLobby(roomId: string, paused: boolean): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.paused = paused;
    room.isDirty = true;

    logEvent({
      roomId: room.config.roomId,
      type: paused ? 'lobby_paused' : 'lobby_resumed',
      actor: 'admin',
      message: paused ? 'Lobby paused.' : 'Lobby resumed.',
    });

    return true;
  }

  public resetRoom(roomId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    room.state = 'lobby';
    room.targetTextEntry = undefined;
    room.countdownEndsAt = undefined;
    room.testEndsAt = undefined;
    room.submissions.clear();

    for (const p of room.participants.values()) {
      p.status = 'joined';
      p.attemptsUsed = 0;
      p.progress = 0;
      p.currentWpmEstimate = 0;
    }

    updateRoomStateInDb(room.config.roomId, 'lobby');
    room.isDirty = true;

    logEvent({
      roomId: room.config.roomId,
      type: 'room_reset',
      actor: 'admin',
      message: 'Room reset for new round.',
    });

    return true;
  }

  public duplicateRoom(roomId: string): { room: LiveRoom; code: string; numericCode: string } | null {
    const existing = this.getRoom(roomId);
    if (!existing) return null;

    return this.createRoom({
      title: `${existing.config.title} (Copy)`,
      language: existing.config.language,
      timerSeconds: existing.config.timerSeconds,
      attemptsPerParticipant: existing.config.attemptsPerParticipant,
      minAccuracy: existing.config.minAccuracy,
      maxParticipants: existing.config.maxParticipants,
      isPrivate: existing.config.isPrivate,
      backspaceMode: existing.config.backspaceMode,
      hasPunctuation: existing.config.hasPunctuation,
      hasNumbers: existing.config.hasNumbers,
    });
  }

  public deleteRoom(roomId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const code = room.config.roomId;
    const num = room.config.numericCode;

    this.rooms.delete(code);
    if (num) this.numericIndex.delete(num);

    db.prepare('DELETE FROM rooms WHERE room_id = ?').run(code);

    logEvent({
      type: 'room_deleted',
      severity: 'warn',
      actor: 'admin',
      message: `Room "${room.config.title}" (${code}) was deleted.`,
    });

    return true;
  }

  public handleDisconnect(socketId: string): { roomId?: string; participantId?: string } {
    for (const room of this.rooms.values()) {
      for (const p of room.participants.values()) {
        if (p.socketId === socketId) {
          p.status = 'disconnected';
          room.isDirty = true;
          logEvent({
            roomId: room.config.roomId,
            type: 'participant_disconnected',
            actor: p.name,
            message: `${p.name} disconnected.`,
          });
          return { roomId: room.config.roomId, participantId: p.id };
        }
      }
    }
    return {};
  }

  public getSnapshot(roomId: string): RoomSnapshot | null {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const { hostToken, ...publicConfig } = room.config;
    const participantsList = Array.from(room.participants.values());
    const leaderboard = this.getLeaderboard(room.config.roomId);

    return {
      config: publicConfig,
      state: room.state,
      targetTextId: room.state !== 'lobby' ? room.targetTextEntry?.id : undefined,
      targetText: room.state !== 'lobby' ? room.targetTextEntry?.text : undefined,
      countdownEndsAt: room.countdownEndsAt,
      testEndsAt: room.testEndsAt,
      participants: participantsList,
      leaderboard,
      locked: room.locked,
    };
  }

  public getAllRoomsList(): Array<{
    roomId: string;
    numericCode: string;
    title: string;
    state: RoomState;
    timerSeconds: number;
    participantsCount: number;
    submissionsCount: number;
    locked: boolean;
    createdAt?: number;
  }> {
    const list = [];
    for (const r of this.rooms.values()) {
      list.push({
        roomId: r.config.roomId,
        numericCode: r.config.numericCode,
        title: r.config.title,
        state: r.state,
        timerSeconds: r.config.timerSeconds,
        participantsCount: r.participants.size,
        submissionsCount: r.submissions.size,
        locked: r.locked,
      });
    }
    return list;
  }

  public cleanupExpiredRooms(): void {
    const now = Date.now();
    for (const [code, room] of this.rooms.entries()) {
      const isStale = Array.from(room.participants.values()).every(
        (p) => now - p.lastActiveAt > 24 * 60 * 60 * 1000
      );
      if (isStale && room.participants.size > 0) {
        this.rooms.delete(code);
        if (room.config.numericCode) {
          this.numericIndex.delete(room.config.numericCode);
        }
      }
    }
  }
}

export const roomManager = new RoomManager();
