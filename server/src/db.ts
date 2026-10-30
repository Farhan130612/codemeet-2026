import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { RoomConfig, Participant, ScoringResult, EventLogEntry } from './types.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const isTest =
  process.env.NODE_ENV === 'test' ||
  process.argv.some((arg) => arg.includes('test') || arg.includes('vitest') || arg.includes('loadTest'));

const DB_PATH =
  process.env.DATABASE_PATH ||
  (isTest ? ':memory:' : path.join(DB_DIR, 'codemeet_typing.db'));
export const db = new Database(DB_PATH);

// Pragmas for ultra-high performance in SQLite (WAL mode, memory temp store, normal synchronous)
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('temp_store = MEMORY');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    room_id TEXT PRIMARY KEY,
    numeric_code TEXT,
    title TEXT NOT NULL,
    host_token TEXT NOT NULL,
    language TEXT NOT NULL,
    timer_seconds INTEGER NOT NULL,
    attempts_per_participant INTEGER NOT NULL,
    min_accuracy REAL NOT NULL,
    max_participants INTEGER NOT NULL,
    is_private INTEGER NOT NULL,
    backspace_mode TEXT NOT NULL,
    has_punctuation INTEGER NOT NULL,
    has_numbers INTEGER NOT NULL,
    scheduled_start_time INTEGER,
    state TEXT NOT NULL DEFAULT 'lobby',
    target_text_id TEXT,
    target_text TEXT,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    name TEXT NOT NULL,
    usn TEXT NOT NULL DEFAULT '',
    is_host INTEGER NOT NULL DEFAULT 0,
    attempts_used INTEGER NOT NULL DEFAULT 0,
    joined_at INTEGER NOT NULL,
    last_active_at INTEGER NOT NULL,
    FOREIGN KEY(room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    usn TEXT NOT NULL DEFAULT '',
    net_wpm REAL NOT NULL,
    raw_wpm REAL NOT NULL,
    accuracy REAL NOT NULL,
    correct_characters INTEGER NOT NULL,
    uncorrected_errors INTEGER NOT NULL,
    corrected_errors INTEGER NOT NULL,
    total_typed_characters INTEGER NOT NULL,
    elapsed_seconds REAL NOT NULL,
    is_disqualified INTEGER NOT NULL,
    disqualification_reason TEXT,
    flagged_for_review INTEGER NOT NULL,
    review_reasons TEXT,
    consistency INTEGER NOT NULL,
    submitted_at INTEGER NOT NULL,
    FOREIGN KEY(room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY(participant_id) REFERENCES participants(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS event_logs (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    actor TEXT NOT NULL,
    message TEXT NOT NULL,
    details TEXT,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS banned_participants (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    name TEXT,
    usn TEXT,
    ip TEXT,
    reason TEXT,
    banned_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_rooms_expires ON rooms(expires_at);
  CREATE INDEX IF NOT EXISTS idx_attempts_room ON attempts(room_id, net_wpm DESC);
  CREATE INDEX IF NOT EXISTS idx_event_logs_timestamp ON event_logs(timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_event_logs_room ON event_logs(room_id);
`);

// Safe column migrations in case DB already exists
try {
  db.exec(`ALTER TABLE rooms ADD COLUMN numeric_code TEXT;`);
} catch {}
try {
  db.exec(`ALTER TABLE rooms ADD COLUMN scheduled_start_time INTEGER;`);
} catch {}
try {
  db.exec(`ALTER TABLE participants ADD COLUMN usn TEXT NOT NULL DEFAULT '';`);
} catch {}
try {
  db.exec(`ALTER TABLE attempts ADD COLUMN usn TEXT NOT NULL DEFAULT '';`);
} catch {}

// Create index after ensuring column exists
try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_rooms_numeric ON rooms(numeric_code);`);
} catch {}

export function saveRoomToDb(config: RoomConfig, targetTextId?: string, targetText?: string): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO rooms (
      room_id, numeric_code, title, host_token, language, timer_seconds, attempts_per_participant,
      min_accuracy, max_participants, is_private, backspace_mode, has_punctuation, has_numbers,
      scheduled_start_time, state, target_text_id, target_text, created_at, expires_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000;

  stmt.run(
    config.roomId,
    config.numericCode || null,
    config.title,
    config.hostToken,
    config.language,
    config.timerSeconds,
    config.attemptsPerParticipant,
    config.minAccuracy,
    config.maxParticipants,
    config.isPrivate ? 1 : 0,
    config.backspaceMode,
    config.hasPunctuation ? 1 : 0,
    config.hasNumbers ? 1 : 0,
    config.scheduledStartTime || null,
    'lobby',
    targetTextId || null,
    targetText || null,
    now,
    expiresAt
  );
}

export function updateRoomStateInDb(roomId: string, state: string, targetTextId?: string, targetText?: string): void {
  const stmt = db.prepare(`
    UPDATE rooms
    SET state = ?, target_text_id = COALESCE(?, target_text_id), target_text = COALESCE(?, target_text)
    WHERE room_id = ?
  `);
  stmt.run(state, targetTextId || null, targetText || null, roomId);
}

export function saveParticipantToDb(participant: Participant): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO participants (
      id, room_id, name, usn, is_host, attempts_used, joined_at, last_active_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    participant.id,
    participant.roomId,
    participant.name,
    participant.usn || '',
    participant.isHost ? 1 : 0,
    participant.attemptsUsed,
    participant.joinedAt,
    participant.lastActiveAt
  );
}

export function saveAttemptToDb(roomId: string, result: ScoringResult): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO attempts (
      id, room_id, participant_id, participant_name, usn, net_wpm, raw_wpm, accuracy,
      correct_characters, uncorrected_errors, corrected_errors, total_typed_characters,
      elapsed_seconds, is_disqualified, disqualification_reason, flagged_for_review,
      review_reasons, consistency, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const attemptId = `${roomId}-${result.participantId}-${result.submittedAt}`;

  stmt.run(
    attemptId,
    roomId,
    result.participantId,
    result.participantName,
    result.usn || '',
    result.netWpm,
    result.rawWpm,
    result.accuracy,
    result.correctCharacters,
    result.uncorrectedErrors,
    result.correctedErrors,
    result.totalTypedCharacters,
    result.elapsedSeconds,
    result.isDisqualified ? 1 : 0,
    result.disqualificationReason || null,
    result.flaggedForReview ? 1 : 0,
    JSON.stringify(result.reviewReasons),
    result.consistency,
    result.submittedAt
  );
}

export function getRoomAttemptsFromDb(roomId: string): ScoringResult[] {
  const stmt = db.prepare(`
    SELECT * FROM attempts WHERE room_id = ? ORDER BY is_disqualified ASC, net_wpm DESC, accuracy DESC, submitted_at ASC
  `);
  const rows = stmt.all(roomId) as any[];

  return rows.map((r, idx) => ({
    participantId: r.participant_id,
    participantName: r.participant_name,
    usn: r.usn || '',
    netWpm: r.net_wpm,
    rawWpm: r.raw_wpm,
    accuracy: r.accuracy,
    correctCharacters: r.correct_characters,
    uncorrectedErrors: r.uncorrected_errors,
    correctedErrors: r.corrected_errors,
    totalTypedCharacters: r.total_typed_characters,
    elapsedSeconds: r.elapsed_seconds,
    isDisqualified: Boolean(r.is_disqualified),
    disqualificationReason: r.disqualification_reason || undefined,
    flaggedForReview: Boolean(r.flagged_for_review),
    reviewReasons: r.review_reasons ? JSON.parse(r.review_reasons) : [],
    consistency: r.consistency,
    submittedAt: r.submitted_at,
    rank: idx + 1,
  }));
}

export function exportRoomToCsv(roomId: string, providedResults?: ScoringResult[]): string {
  const results = (providedResults && providedResults.length > 0)
    ? providedResults
    : getRoomAttemptsFromDb(roomId);
  const headers = [
    'Rank',
    'Participant Name',
    'USN',
    'Net WPM',
    'Raw WPM',
    'Accuracy %',
    'Correct Characters',
    'Uncorrected Errors',
    'Corrected Errors',
    'Total Typed Characters',
    'Elapsed Seconds',
    'Status',
    'Disqualification Reason',
    'Flagged For Review',
    'Review Reasons',
    'Consistency %',
    'Submission Time',
  ];

  const lines = [headers.join(',')];

  for (const r of results) {
    const row = [
      r.rank || '',
      `"${(r.participantName || '').replace(/"/g, '""')}"`,
      `"${(r.usn || '').replace(/"/g, '""')}"`,
      r.netWpm.toFixed(1),
      r.rawWpm.toFixed(1),
      r.accuracy.toFixed(1),
      r.correctCharacters,
      r.uncorrectedErrors,
      r.correctedErrors,
      r.totalTypedCharacters,
      r.elapsedSeconds.toFixed(1),
      r.isDisqualified ? 'DISQUALIFIED' : 'QUALIFIED',
      `"${(r.disqualificationReason || '').replace(/"/g, '""')}"`,
      r.flaggedForReview ? 'YES' : 'NO',
      `"${r.reviewReasons.join('; ').replace(/"/g, '""')}"`,
      r.consistency,
      new Date(r.submittedAt).toISOString(),
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

// AUDIT TRAIL / EVENT LOGS
export function logEvent(entry: {
  id?: string;
  roomId?: string;
  type: string;
  severity?: 'info' | 'warn' | 'error';
  actor: string;
  message: string;
  details?: Record<string, any>;
  timestamp?: number;
}): void {
  const id = entry.id || `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = entry.timestamp || Date.now();
  const severity = entry.severity || 'info';

  const stmt = db.prepare(`
    INSERT INTO event_logs (id, room_id, type, severity, actor, message, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    entry.roomId || null,
    entry.type,
    severity,
    entry.actor,
    entry.message,
    entry.details ? JSON.stringify(entry.details) : null,
    timestamp
  );
}

export function getEventLogs(options?: {
  roomId?: string;
  limit?: number;
  type?: string;
  severity?: string;
}): EventLogEntry[] {
  let query = 'SELECT * FROM event_logs WHERE 1=1';
  const params: any[] = [];

  if (options?.roomId) {
    query += ' AND room_id = ?';
    params.push(options.roomId);
  }
  if (options?.type) {
    query += ' AND type = ?';
    params.push(options.type);
  }
  if (options?.severity) {
    query += ' AND severity = ?';
    params.push(options.severity);
  }

  query += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(options?.limit || 200);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as any[];

  return rows.map((r) => ({
    id: r.id,
    roomId: r.room_id || undefined,
    type: r.type,
    severity: r.severity as any,
    actor: r.actor,
    message: r.message,
    details: r.details ? JSON.parse(r.details) : undefined,
    timestamp: r.timestamp,
  }));
}

// BANNED PARTICIPANTS
export function banParticipant(
  roomId: string,
  name?: string,
  usn?: string,
  ip?: string,
  reason?: string
): void {
  const id = `ban-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const stmt = db.prepare(`
    INSERT INTO banned_participants (id, room_id, name, usn, ip, reason, banned_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, roomId, name || null, usn || null, ip || null, reason || 'Banned by admin', Date.now());

  logEvent({
    roomId,
    type: 'participant_banned',
    severity: 'warn',
    actor: 'admin',
    message: `Participant banned: ${name || ''} (USN: ${usn || ''})`,
    details: { name, usn, ip, reason },
  });
}

export function isParticipantBanned(
  roomId: string,
  name?: string,
  usn?: string,
  ip?: string
): boolean {
  let query = 'SELECT 1 FROM banned_participants WHERE room_id = ? AND (';
  const conditions: string[] = [];
  const params: any[] = [roomId];

  if (name) {
    conditions.push('LOWER(name) = LOWER(?)');
    params.push(name);
  }
  if (usn) {
    conditions.push('LOWER(usn) = LOWER(?)');
    params.push(usn);
  }
  if (ip) {
    conditions.push('ip = ?');
    params.push(ip);
  }

  if (conditions.length === 0) return false;

  query += conditions.join(' OR ') + ') LIMIT 1';
  const row = db.prepare(query).get(...params);
  return Boolean(row);
}

export function cleanExpiredRooms(): void {
  const now = Date.now();
  db.prepare('DELETE FROM rooms WHERE expires_at < ?').run(now);
}
