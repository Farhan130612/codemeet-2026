import { KeystrokeEvent, AntiCheatReport } from './types.js';

export function analyzeKeystrokes(
  keystrokes: KeystrokeEvent[],
  timerSeconds: number
): AntiCheatReport {
  const reasons: string[] = [];
  let rejected = false;
  let flaggedForReview = false;

  if (!keystrokes || keystrokes.length === 0) {
    return {
      isClean: true,
      flaggedForReview: false,
      rejected: false,
      reasons: [],
      metrics: {
        minIntervalMs: 0,
        avgIntervalMs: 0,
        intervalStdDev: 0,
        pasteCount: 0,
        totalBlurredMs: 0,
        sub15msIntervalCount: 0,
        identicalIntervalStreak: 0,
      },
    };
  }

  // 1. Paste detection
  const pasteEvents = keystrokes.filter((k) => k.type === 'paste' || (k.key && k.key.length > 1 && !isSpecialKey(k.key)));
  const pasteCount = pasteEvents.length;
  if (pasteCount > 0) {
    flaggedForReview = true;
    rejected = true;
    reasons.push(`Detected ${pasteCount} paste event(s) or multi-character injection.`);
  }

  // 2. Focus loss tracking
  let totalBlurredMs = 0;
  let blurStart: number | null = null;
  for (const k of keystrokes) {
    if (k.type === 'blur') {
      blurStart = k.timestamp;
    } else if (k.type === 'focus' && blurStart !== null) {
      totalBlurredMs += Math.max(0, k.timestamp - blurStart);
      blurStart = null;
    }
  }
  // If window was blurred for more than 4000ms
  if (totalBlurredMs > 4000) {
    flaggedForReview = true;
    reasons.push(`Participant lost window focus for ${(totalBlurredMs / 1000).toFixed(1)}s during test.`);
  }

  // 3. Timing and physical impossibility validation
  // Filter for printable or backspace keypresses
  const keypresses = keystrokes.filter((k) => !k.type || k.type === 'keydown');

  const intervals: number[] = [];
  let sub15msIntervalCount = 0;
  let consecutiveSub15ms = 0;
  let maxConsecutiveSub15ms = 0;

  let identicalIntervalStreak = 0;
  let maxIdenticalStreak = 0;

  for (let i = 1; i < keypresses.length; i++) {
    const prev = keypresses[i - 1];
    const curr = keypresses[i];
    const delta = curr.timestamp - prev.timestamp;

    // Check negative or unordered timestamps
    if (delta < 0) {
      rejected = true;
      flaggedForReview = true;
      reasons.push('Anomalous keystroke log: chronological order violation (negative interval).');
      break;
    }

    intervals.push(delta);

    // Check sub-15ms intervals
    if (delta < 15) {
      sub15msIntervalCount++;
      consecutiveSub15ms++;
      if (consecutiveSub15ms > maxConsecutiveSub15ms) {
        maxConsecutiveSub15ms = consecutiveSub15ms;
      }
    } else {
      consecutiveSub15ms = 0;
    }

    // Check identical intervals (bot macro detection)
    if (i >= 2) {
      const prevDelta = intervals[intervals.length - 2];
      if (Math.abs(delta - prevDelta) < 1.0) {
        identicalIntervalStreak++;
        if (identicalIntervalStreak > maxIdenticalStreak) {
          maxIdenticalStreak = identicalIntervalStreak;
        }
      } else {
        identicalIntervalStreak = 0;
      }
    }
  }

  const minIntervalMs = intervals.length > 0 ? Math.min(...intervals) : 0;
  const avgIntervalMs = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;

  let intervalStdDev = 0;
  if (intervals.length > 1) {
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgIntervalMs, 2), 0) / intervals.length;
    intervalStdDev = Math.sqrt(variance);
  }

  // Sustained sub-15ms keying: 4+ consecutive sub-15ms strokes or > 12% total strokes under 15ms
  if (maxConsecutiveSub15ms >= 4 || (intervals.length > 10 && sub15msIntervalCount / intervals.length > 0.12)) {
    rejected = true;
    flaggedForReview = true;
    reasons.push(`Inhuman physical input: ${maxConsecutiveSub15ms} consecutive keystrokes under 15ms.`);
  }

  // Suspicious synthetic macro: 12+ consecutive keypresses with identical timing interval
  if (maxIdenticalStreak >= 12 || (intervals.length >= 30 && intervalStdDev < 2.0)) {
    rejected = true;
    flaggedForReview = true;
    reasons.push(`Bot macro signature detected: identical interval streak of ${maxIdenticalStreak} strokes (std dev: ${intervalStdDev.toFixed(1)}ms).`);
  }

  // Check out of bounds timestamp (e.g. keystrokes beyond timer + 3s grace)
  const maxAllowedTimestampMs = (timerSeconds + 3) * 1000;
  const lastKey = keypresses[keypresses.length - 1];
  if (lastKey && lastKey.timestamp > maxAllowedTimestampMs) {
    flaggedForReview = true;
    reasons.push(`Keystrokes continued after test window expired (${(lastKey.timestamp / 1000).toFixed(1)}s > ${timerSeconds}s).`);
  }

  return {
    isClean: reasons.length === 0,
    flaggedForReview,
    rejected,
    reasons,
    metrics: {
      minIntervalMs,
      avgIntervalMs: Math.round(avgIntervalMs * 10) / 10,
      intervalStdDev: Math.round(intervalStdDev * 10) / 10,
      pasteCount,
      totalBlurredMs,
      sub15msIntervalCount,
      identicalIntervalStreak: maxIdenticalStreak,
    },
  };
}

function isSpecialKey(key: string): boolean {
  return [
    'Backspace',
    'Enter',
    'Tab',
    'Shift',
    'Control',
    'Alt',
    'Meta',
    'CapsLock',
    'Escape',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Delete',
  ].includes(key);
}
