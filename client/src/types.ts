export type RoomState = 'draft' | 'lobby' | 'countdown' | 'in_progress' | 'ended' | 'locked' | 'expired';

export type ParticipantStatus = 'joined' | 'ready' | 'typing' | 'finished' | 'disconnected' | 'flagged' | 'removed';

export interface RoomConfig {
  roomId: string;
  numericCode: string;
  title: string;
  language: string;
  timerSeconds: number;
  attemptsPerParticipant: number;
  minAccuracy: number;
  maxParticipants: number;
  isPrivate: boolean;
  backspaceMode: 'all' | 'word' | 'none';
  hasPunctuation: boolean;
  hasNumbers: boolean;
  scheduledStartTime?: number;
}

export interface Participant {
  id: string;
  socketId: string;
  name: string;
  usn: string;
  roomId: string;
  isHost: boolean;
  status: ParticipantStatus;
  attemptsUsed: number;
  joinedAt: number;
  lastActiveAt: number;
  progress: number;
  currentWpmEstimate: number;
  connectionQuality?: 'good' | 'fair' | 'poor';
}

export interface KeystrokeEvent {
  key: string;
  timestamp: number;
  type?: 'keydown' | 'paste' | 'blur' | 'focus';
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
  config: RoomConfig;
  state: RoomState;
  targetTextId?: string;
  targetText?: string;
  countdownEndsAt?: number;
  testEndsAt?: number;
  participants: Participant[];
  leaderboard: ScoringResult[];
  locked: boolean;
}
