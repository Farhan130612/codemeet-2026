export type RoomState = 'draft' | 'lobby' | 'countdown' | 'in_progress' | 'ended' | 'locked' | 'expired';

export type ParticipantStatus = 'joined' | 'ready' | 'typing' | 'finished' | 'disconnected' | 'flagged' | 'removed';

export interface RoomConfig {
  roomId: string; // 8-char random alphanumeric code
  numericCode: string; // 6-digit numeric room code for read-aloud / projector (e.g. 482910)
  title: string;
  hostToken: string; // Secure token for host authorization
  language: string; // Default 'en'
  timerSeconds: number; // 15, 30, 60, 120
  attemptsPerParticipant: number; // 1, 2, 3, 5
  minAccuracy: number; // Default 90%
  maxParticipants: number; // Default 150
  isPrivate: boolean;
  backspaceMode: 'all' | 'word' | 'none'; // Default 'all'
  hasPunctuation: boolean;
  hasNumbers: boolean;
  scheduledStartTime?: number;
}

export interface Participant {
  id: string; // Persistent UUID
  socketId: string;
  name: string;
  usn: string; // University Seat Number (e.g. 4SU22CS089)
  roomId: string;
  isHost: boolean;
  status: ParticipantStatus;
  attemptsUsed: number;
  joinedAt: number;
  lastActiveAt: number;
  progress: number; // 0 - 100%
  currentWpmEstimate: number;
  connectionQuality?: 'good' | 'fair' | 'poor';
}

export interface KeystrokeEvent {
  key: string;
  timestamp: number; // ms offset relative to test start
  type?: 'keydown' | 'paste' | 'blur' | 'focus';
}

export interface SubmissionPayload {
  roomId: string;
  participantId: string;
  targetTextId: string;
  keystrokes: KeystrokeEvent[];
  clientElapsedMs: number;
}

export interface AntiCheatReport {
  isClean: boolean;
  flaggedForReview: boolean;
  rejected: boolean;
  reasons: string[];
  metrics: {
    minIntervalMs: number;
    avgIntervalMs: number;
    intervalStdDev: number;
    pasteCount: number;
    totalBlurredMs: number;
    sub15msIntervalCount: number;
    identicalIntervalStreak: number;
  };
}

export interface ScoringResult {
  participantId: string;
  participantName: string;
  usn: string;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  correctCharacters: number;
  uncorrectedErrors: number;
  correctedErrors: number;
  totalTypedCharacters: number;
  elapsedSeconds: number;
  isDisqualified: boolean;
  disqualificationReason?: string;
  flaggedForReview: boolean;
  reviewReasons: string[];
  consistency: number;
  rank?: number;
  submittedAt: number;
}

export interface EventLogEntry {
  id: string;
  roomId?: string;
  type: string;
  severity: 'info' | 'warn' | 'error';
  actor: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
}

export interface RoomSnapshot {
  config: Omit<RoomConfig, 'hostToken'>;
  state: RoomState;
  targetTextId?: string;
  targetText?: string;
  countdownEndsAt?: number;
  testEndsAt?: number;
  participants: Participant[];
  leaderboard: ScoringResult[];
  locked: boolean;
}
