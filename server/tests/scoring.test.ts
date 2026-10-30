import { describe, it, expect } from 'vitest';
import { calculateAuthoritativeScore, rankLeaderboard } from '../src/scoring.js';
import { analyzeKeystrokes } from '../src/antiCheat.js';
import { KeystrokeEvent, ScoringResult } from '../src/types.js';

describe('Server-Authoritative Scoring Engine', () => {
  const targetText = 'The quick brown fox jumps over the lazy dog.';
  const timerSeconds = 60;

  // Helper to simulate typing a string with natural human jitter
  function createKeystrokeStream(
    chars: string[],
    baseIntervalMs = 120,
    startTimeMs = 0,
    withJitter = true
  ): KeystrokeEvent[] {
    let t = startTimeMs;
    return chars.map((char, index) => {
      const event: KeystrokeEvent = { key: char, timestamp: t, type: 'keydown' };
      const jitter = withJitter ? ((index * 17) % 31) - 15 : 0;
      t += Math.max(30, baseIntervalMs + jitter);
      return event;
    });
  }

  it('correctly calculates 100% accurate typing without errors', () => {
    const chars = targetText.split('');
    const keystrokes = createKeystrokeStream(chars, 450);

    const result = calculateAuthoritativeScore({
      participantId: 'p1',
      participantName: 'Alice',
      targetText,
      keystrokes,
      timerSeconds,
      minAccuracy: 90,
    });

    expect(result.correctCharacters).toBe(44);
    expect(result.uncorrectedErrors).toBe(0);
    expect(result.correctedErrors).toBe(0);
    expect(result.accuracy).toBe(100);
    expect(result.totalTypedCharacters).toBe(44);
    expect(result.isDisqualified).toBe(false);
    expect(result.netWpm).toBeGreaterThan(10);
    expect(result.rawWpm).toBeGreaterThan(10);
  });

  it('handles all-wrong typing and key mashing (THE REFERENCE SITE BUG FIX)', () => {
    const mashedKeys = new Array(300).fill('@');
    const keystrokes = createKeystrokeStream(mashedKeys, 100);

    const result = calculateAuthoritativeScore({
      participantId: 'masher',
      participantName: 'KeyMasher',
      targetText,
      keystrokes,
      timerSeconds,
      minAccuracy: 90,
    });

    // Mashing wrong keys must produce 0 Net WPM, 0% accuracy, and be disqualified!
    expect(result.correctCharacters).toBe(0);
    expect(result.uncorrectedErrors).toBeGreaterThan(40);
    expect(result.accuracy).toBe(0);
    expect(result.netWpm).toBe(0);
    expect(result.rawWpm).toBeGreaterThan(50);
    expect(result.isDisqualified).toBe(true);
    expect(result.disqualificationReason).toContain('below required threshold');
  });

  it('handles empty input cleanly without throwing or NaN', () => {
    const result = calculateAuthoritativeScore({
      participantId: 'empty',
      participantName: 'IdleUser',
      targetText,
      keystrokes: [],
      timerSeconds,
    });

    expect(result.netWpm).toBe(0);
    expect(result.rawWpm).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.correctCharacters).toBe(0);
    expect(result.totalTypedCharacters).toBe(0);
    expect(result.isDisqualified).toBe(false);
  });

  it('handles 0-second submission without division by zero', () => {
    const keystrokes: KeystrokeEvent[] = [
      { key: 'T', timestamp: 0, type: 'keydown' },
    ];

    const result = calculateAuthoritativeScore({
      participantId: 'zero-sec',
      participantName: 'FastQuit',
      targetText,
      keystrokes,
      timerSeconds,
    });

    expect(result.netWpm).toBe(0);
    expect(result.rawWpm).toBe(0);
    expect(result.accuracy).toBe(0);
  });

  it('accurately tracks backspacing and counts corrected errors', () => {
    const stream: KeystrokeEvent[] = [
      { key: 'T', timestamp: 0 },
      { key: 'h', timestamp: 100 },
      { key: 'x', timestamp: 200 },
      { key: 'Backspace', timestamp: 350 },
      { key: 'e', timestamp: 500 },
      { key: ' ', timestamp: 650 },
    ];

    const result = calculateAuthoritativeScore({
      participantId: 'backspacer',
      participantName: 'CarefulTypist',
      targetText,
      keystrokes: stream,
      timerSeconds,
      minAccuracy: 80,
    });

    expect(result.correctedErrors).toBe(1);
    expect(result.uncorrectedErrors).toBe(0);
    expect(result.correctCharacters).toBe(4);
    expect(result.totalTypedCharacters).toBe(5);
    expect(result.accuracy).toBe(80);
    expect(result.netWpm).toBeGreaterThan(0);
  });

  it('handles Ctrl+Backspace word deletion correctly', () => {
    // Type 'The ', 'wrng', then BackspaceWord, then 'quick '
    const stream: KeystrokeEvent[] = [
      { key: 'T', timestamp: 0 },
      { key: 'h', timestamp: 80 },
      { key: 'e', timestamp: 160 },
      { key: ' ', timestamp: 240 },
      { key: 'w', timestamp: 320 },
      { key: 'r', timestamp: 400 },
      { key: 'n', timestamp: 480 },
      { key: 'g', timestamp: 560 },
      { key: 'BackspaceWord', timestamp: 700 },
      { key: 'q', timestamp: 850 },
      { key: 'u', timestamp: 930 },
      { key: 'i', timestamp: 1010 },
      { key: 'c', timestamp: 1090 },
      { key: 'k', timestamp: 1170 },
      { key: ' ', timestamp: 1250 },
    ];

    const result = calculateAuthoritativeScore({
      participantId: 'word-deleter',
      participantName: 'PowerTypist',
      targetText,
      keystrokes: stream,
      timerSeconds,
    });

    // 4 errors ('wrng') corrected via word backspace
    expect(result.correctedErrors).toBe(4);
    expect(result.uncorrectedErrors).toBe(0);
    expect(result.correctCharacters).toBe(10); // 'The quick '
  });

  it('accounts for extra characters past target length as errors', () => {
    const shortTarget = 'Cat';
    const stream = createKeystrokeStream(['C', 'a', 't', 's', '!', '?'], 150);

    const result = calculateAuthoritativeScore({
      participantId: 'extra',
      participantName: 'ExtraKeys',
      targetText: shortTarget,
      keystrokes: stream,
      timerSeconds,
    });

    expect(result.correctCharacters).toBe(3);
    expect(result.uncorrectedErrors).toBe(3);
  });

  it('handles skipped words and out-of-order typing accurately', () => {
    // Target is 'The quick brown fox'
    // User types 'The brown fox' (skipping 'quick ')
    const typed = 'The brown fox'.split('');
    const stream = createKeystrokeStream(typed, 150);

    const result = calculateAuthoritativeScore({
      participantId: 'skipper',
      participantName: 'WordSkipper',
      targetText,
      keystrokes: stream,
      timerSeconds,
    });

    // 'The ' matches (4 chars) + space at index 9 matches (1 char) = 5 correct
    // 8 uncorrected errors out of 13 characters
    expect(result.correctCharacters).toBe(5);
    expect(result.uncorrectedErrors).toBe(8);
    expect(result.accuracy).toBeLessThan(50);
    expect(result.isDisqualified).toBe(true);
  });

  it('ranks leaderboard by Net WPM, then Accuracy, then earlier submission', () => {
    const now = Date.now();
    const results: ScoringResult[] = [
      {
        participantId: 'p1',
        participantName: 'Bob (80 WPM, 95% Acc, submitted at t=10)',
        netWpm: 80,
        rawWpm: 85,
        accuracy: 95,
        correctCharacters: 200,
        uncorrectedErrors: 2,
        correctedErrors: 5,
        totalTypedCharacters: 210,
        elapsedSeconds: 30,
        isDisqualified: false,
        flaggedForReview: false,
        reviewReasons: [],
        consistency: 90,
        submittedAt: now + 10000,
      },
      {
        participantId: 'p2',
        participantName: 'Alice (80 WPM, 98% Acc, tie-break by accuracy)',
        netWpm: 80,
        rawWpm: 82,
        accuracy: 98,
        correctCharacters: 200,
        uncorrectedErrors: 0,
        correctedErrors: 2,
        totalTypedCharacters: 204,
        elapsedSeconds: 30,
        isDisqualified: false,
        flaggedForReview: false,
        reviewReasons: [],
        consistency: 92,
        submittedAt: now + 12000,
      },
      {
        participantId: 'p3',
        participantName: 'Charlie (95 WPM, 92% Acc - Rank 1)',
        netWpm: 95,
        rawWpm: 100,
        accuracy: 92,
        correctCharacters: 250,
        uncorrectedErrors: 5,
        correctedErrors: 8,
        totalTypedCharacters: 270,
        elapsedSeconds: 30,
        isDisqualified: false,
        flaggedForReview: false,
        reviewReasons: [],
        consistency: 88,
        submittedAt: now + 15000,
      },
      {
        participantId: 'p4',
        participantName: 'Dave (110 Net WPM but Disqualified 85% Acc)',
        netWpm: 110,
        rawWpm: 130,
        accuracy: 85,
        correctCharacters: 300,
        uncorrectedErrors: 15,
        correctedErrors: 20,
        totalTypedCharacters: 350,
        elapsedSeconds: 30,
        isDisqualified: true,
        disqualificationReason: 'Below 90% threshold',
        flaggedForReview: false,
        reviewReasons: ['Below 90% threshold'],
        consistency: 80,
        submittedAt: now + 5000,
      },
      {
        participantId: 'p5',
        participantName: 'Eve (80 WPM, 95% Acc, submitted at t=8 - beats Bob)',
        netWpm: 80,
        rawWpm: 85,
        accuracy: 95,
        correctCharacters: 200,
        uncorrectedErrors: 2,
        correctedErrors: 5,
        totalTypedCharacters: 210,
        elapsedSeconds: 30,
        isDisqualified: false,
        flaggedForReview: false,
        reviewReasons: [],
        consistency: 90,
        submittedAt: now + 8000,
      },
    ];

    const ranked = rankLeaderboard(results);

    // Charlie has highest Net WPM among qualifiers -> Rank 1
    expect(ranked[0].participantId).toBe('p3');
    expect(ranked[0].rank).toBe(1);

    // Alice has 80 WPM, 98% Acc -> Rank 2
    expect(ranked[1].participantId).toBe('p2');
    expect(ranked[1].rank).toBe(2);

    // Eve and Bob both have 80 WPM and 95% Acc, but Eve submitted earlier (now+8000 < now+10000) -> Eve is Rank 3
    expect(ranked[2].participantId).toBe('p5');
    expect(ranked[2].rank).toBe(3);

    // Bob is Rank 4
    expect(ranked[3].participantId).toBe('p1');
    expect(ranked[3].rank).toBe(4);

    // Dave is disqualified, ranked last
    expect(ranked[4].participantId).toBe('p4');
    expect(ranked[4].isDisqualified).toBe(true);
  });
});

describe('Anti-Cheat & Physical Impossibility Engine', () => {
  it('detects and flags paste injections', () => {
    const keystrokes: KeystrokeEvent[] = [
      { key: 'T', timestamp: 0, type: 'keydown' },
      { key: 'The quick brown fox', timestamp: 100, type: 'paste' },
    ];

    const report = analyzeKeystrokes(keystrokes, 60);
    expect(report.isClean).toBe(false);
    expect(report.rejected).toBe(true);
    expect(report.reasons.some((r) => r.includes('paste'))).toBe(true);
  });

  it('rejects sustained sub-15ms keystroke rates (bot injection)', () => {
    const keystrokes: KeystrokeEvent[] = [];
    for (let i = 0; i < 20; i++) {
      keystrokes.push({ key: 'a', timestamp: i * 5, type: 'keydown' });
    }

    const report = analyzeKeystrokes(keystrokes, 60);
    expect(report.rejected).toBe(true);
    expect(report.reasons.some((r) => r.includes('Inhuman physical input'))).toBe(true);
  });

  it('detects synthetic bot macro with identical timing intervals', () => {
    const keystrokes: KeystrokeEvent[] = [];
    for (let i = 0; i < 35; i++) {
      keystrokes.push({ key: 'a', timestamp: i * 40, type: 'keydown' });
    }

    const report = analyzeKeystrokes(keystrokes, 60);
    expect(report.rejected).toBe(true);
    expect(report.reasons.some((r) => r.includes('Bot macro signature'))).toBe(true);
  });

  it('flags long window focus loss for host review', () => {
    const keystrokes: KeystrokeEvent[] = [
      { key: 'a', timestamp: 0, type: 'keydown' },
      { key: '', timestamp: 1000, type: 'blur' },
      { key: '', timestamp: 7000, type: 'focus' },
      { key: 'b', timestamp: 7500, type: 'keydown' },
    ];

    const report = analyzeKeystrokes(keystrokes, 60);
    expect(report.flaggedForReview).toBe(true);
    expect(report.reasons.some((r) => r.includes('lost window focus'))).toBe(true);
  });
});
