import { KeystrokeEvent, ScoringResult } from './types.js';
import { analyzeKeystrokes } from './antiCheat.js';

export interface ScoreCalculationOptions {
  participantId: string;
  participantName: string;
  usn?: string;
  targetText: string;
  keystrokes: KeystrokeEvent[];
  timerSeconds: number;
  minAccuracy?: number; // Default 90%
  submittedAt?: number;
}

/**
 * Server-authoritative keystroke replay and scoring engine.
 * Never trusts any client-provided metrics. Replays the raw keystroke sequence
 * against the server's locked target text to calculate Net WPM, Raw WPM,
 * Accuracy, Uncorrected and Corrected Errors, and Consistency.
 */
export function calculateAuthoritativeScore(options: ScoreCalculationOptions): ScoringResult {
  const {
    participantId,
    participantName,
    targetText,
    keystrokes,
    timerSeconds,
    minAccuracy = 90,
    submittedAt = Date.now(),
  } = options;

  // 1. Anti-cheat and physical impossibility analysis
  const antiCheat = analyzeKeystrokes(keystrokes, timerSeconds);

  // 2. Determine true elapsed time from keystrokes
  let elapsedMs = 0;
  if (keystrokes.length > 0) {
    const firstTimestamp = Math.max(0, keystrokes[0].timestamp);
    const lastTimestamp = Math.max(firstTimestamp, keystrokes[keystrokes.length - 1].timestamp);
    elapsedMs = lastTimestamp - firstTimestamp;
  }

  // Bound elapsed time by room timer (with 1.5s tolerance for final network packet)
  const maxElapsedMs = timerSeconds * 1000;
  // If elapsed time is 0 or keystrokes are empty
  const effectiveElapsedSeconds = Math.min(
    timerSeconds,
    Math.max(0, elapsedMs / 1000)
  );
  const elapsedMinutes = effectiveElapsedSeconds / 60;

  // Edge Case: 0-second or empty submission
  if (elapsedMinutes <= 0 || !keystrokes || keystrokes.length === 0) {
    return {
      participantId,
      participantName,
      usn: options.usn || '',
      netWpm: 0,
      rawWpm: 0,
      accuracy: 0,
      correctCharacters: 0,
      uncorrectedErrors: 0,
      correctedErrors: 0,
      totalTypedCharacters: 0,
      elapsedSeconds: 0,
      isDisqualified: false,
      flaggedForReview: antiCheat.flaggedForReview,
      reviewReasons: antiCheat.reasons,
      consistency: 0,
      submittedAt,
    };
  }

  // 3. Replay typing buffer from keystrokes
  // typedBuffer holds the current state of characters typed so far
  let typedBuffer: string[] = [];
  let totalCharacterKeystrokes = 0; // All printable characters typed (for Raw WPM)
  let correctedErrors = 0;

  // Slices for consistency calculation (1-second buckets)
  const bucketCount = Math.max(1, Math.ceil(effectiveElapsedSeconds));
  const charactersPerSecondBucket = new Array<number>(bucketCount).fill(0);

  for (const event of keystrokes) {
    if (event.type === 'blur' || event.type === 'focus') {
      continue;
    }

    const key = event.key;
    const bucketIndex = Math.min(
      bucketCount - 1,
      Math.max(0, Math.floor(event.timestamp / 1000))
    );

    if (key === 'Backspace') {
      if (typedBuffer.length > 0) {
        const lastIdx = typedBuffer.length - 1;
        const targetChar = targetText[lastIdx];
        const removedChar = typedBuffer[lastIdx];

        // If the removed character did NOT match the target, it was an error that has now been corrected
        if (targetChar !== undefined && removedChar !== targetChar) {
          correctedErrors++;
        }
        typedBuffer.pop();
      }
    } else if (key === 'BackspaceWord') {
      // Ctrl+Backspace or Option+Backspace word deletion
      while (typedBuffer.length > 0) {
        const lastIdx = typedBuffer.length - 1;
        const targetChar = targetText[lastIdx];
        const removedChar = typedBuffer[lastIdx];
        if (targetChar !== undefined && removedChar !== targetChar) {
          correctedErrors++;
        }
        typedBuffer.pop();
        if (typedBuffer.length > 0 && typedBuffer[typedBuffer.length - 1] === ' ') {
          break;
        }
      }
    } else if (key && key.length === 1) {
      // Regular printable character (letters, numbers, space, punctuation)
      totalCharacterKeystrokes++;
      typedBuffer.push(key);
      charactersPerSecondBucket[bucketIndex]++;
    }
  }

  // 4. Compare final reconstructed string against authoritative targetText
  let correctCharacters = 0;
  let uncorrectedErrors = 0;

  const compareLength = Math.min(typedBuffer.length, targetText.length);
  for (let i = 0; i < compareLength; i++) {
    const typedChar = typedBuffer[i];
    const targetChar = targetText[i];

    if (typedChar === targetChar) {
      correctCharacters++;
    } else {
      uncorrectedErrors++;
    }
  }

  // Any extra characters typed past targetText length are also uncorrected errors
  if (typedBuffer.length > targetText.length) {
    uncorrectedErrors += typedBuffer.length - targetText.length;
  }

  // 5. Compute WPM and Accuracy
  // Raw WPM = (all typed characters / 5) / elapsed minutes
  const rawWpm = Number(((totalCharacterKeystrokes / 5) / elapsedMinutes).toFixed(1));

  // Net WPM = (correctly typed characters / 5) / elapsed minutes
  // We subtract uncorrected errors if present: Net WPM = Math.max(0, (correctCharacters - uncorrectedErrors) / 5) / elapsedMinutes
  // If user typed all wrong, correctCharacters is 0, Net WPM is strictly 0.
  const netWpm = Number(
    (Math.max(0, (correctCharacters - uncorrectedErrors) / 5) / elapsedMinutes).toFixed(1)
  );

  // Accuracy % = correct characters / total typed characters * 100
  let accuracy = 0;
  if (totalCharacterKeystrokes > 0) {
    accuracy = Number(
      Math.min(100, Math.max(0, (correctCharacters / totalCharacterKeystrokes) * 100)).toFixed(1)
    );
  }

  // 6. Compute Consistency %
  // Measure standard deviation of WPM across 1-second intervals
  let consistency = 100;
  if (charactersPerSecondBucket.length > 1) {
    const wpmBuckets = charactersPerSecondBucket.map((chars) => (chars / 5) * 60);
    const meanWpm = wpmBuckets.reduce((sum, val) => sum + val, 0) / wpmBuckets.length;
    if (meanWpm > 0) {
      const variance =
        wpmBuckets.reduce((sum, val) => sum + Math.pow(val - meanWpm, 2), 0) / wpmBuckets.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / meanWpm;
      consistency = Math.round(Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100)));
    } else {
      consistency = 0;
    }
  }

  // 7. Disqualification and Host Review determination
  let isDisqualified = false;
  let disqualificationReason: string | undefined;

  // Disqualification Rule: Minimum accuracy check
  if (accuracy < minAccuracy) {
    isDisqualified = true;
    disqualificationReason = `Accuracy (${accuracy}%) below required threshold (${minAccuracy}%).`;
  }

  // Anti-cheat rejection flags
  if (antiCheat.rejected) {
    isDisqualified = true;
    disqualificationReason = antiCheat.reasons.join(' | ');
  }

  const reviewReasons = [...antiCheat.reasons];
  if (isDisqualified && disqualificationReason && !reviewReasons.includes(disqualificationReason)) {
    reviewReasons.push(disqualificationReason);
  }

  return {
    participantId,
    participantName,
    usn: options.usn || '',
    netWpm,
    rawWpm,
    accuracy,
    correctCharacters,
    uncorrectedErrors,
    correctedErrors,
    totalTypedCharacters: totalCharacterKeystrokes,
    elapsedSeconds: Number(effectiveElapsedSeconds.toFixed(1)),
    isDisqualified,
    disqualificationReason,
    flaggedForReview: antiCheat.flaggedForReview,
    reviewReasons,
    consistency,
    submittedAt,
  };
}

/**
 * Leaderboard rank comparator.
 * Primary: Qualified participants first.
 * Ranking: Net WPM (descending)
 * Tie-breaker 1: Accuracy % (descending)
 * Tie-breaker 2: Earlier submission timestamp (ascending)
 */
export function rankLeaderboard(results: ScoringResult[]): ScoringResult[] {
  const sorted = [...results].sort((a, b) => {
    // 1. Qualified vs Disqualified
    if (a.isDisqualified !== b.isDisqualified) {
      return a.isDisqualified ? 1 : -1;
    }

    // 2. Net WPM (higher first)
    if (b.netWpm !== a.netWpm) {
      return b.netWpm - a.netWpm;
    }

    // 3. Accuracy (higher first)
    if (b.accuracy !== a.accuracy) {
      return b.accuracy - a.accuracy;
    }

    // 4. Earlier submission (lower timestamp first)
    return a.submittedAt - b.submittedAt;
  });

  // Assign numeric ranks
  return sorted.map((res, index) => ({
    ...res,
    rank: index + 1,
  }));
}
