import React, { useEffect, useRef, useState, useCallback } from 'react';
import { KeystrokeEvent, ScoringResult } from '../types.js';
import { socket } from '../socket.js';
import { Timer, Zap, Target, AlertTriangle } from 'lucide-react';

interface TypingAreaProps {
  roomId: string;
  participantId: string;
  targetText: string;
  targetTextId: string;
  timerSeconds: number;
  countdownEndsAt?: number;
  testEndsAt?: number;
  onFinish: (result: ScoringResult) => void;
  backspaceMode?: 'all' | 'word' | 'none';
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  roomId,
  participantId,
  targetText,
  targetTextId,
  timerSeconds,
  countdownEndsAt,
  testEndsAt,
  onFinish,
  backspaceMode = 'all',
}) => {
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(timerSeconds);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(true);

  const keystrokesRef = useRef<KeystrokeEvent[]>([]);
  const testStartTimeRef = useRef<number | null>(null);
  const isFinishedRef = useRef<boolean>(false);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Synchronized countdown
  useEffect(() => {
    if (!countdownEndsAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffMs = countdownEndsAt - now;

      if (diffMs > 0) {
        setCountdownRemaining(Math.ceil(diffMs / 1000));
        setIsActive(false);
      } else {
        setCountdownRemaining(null);
        setIsActive(true);
        if (!testStartTimeRef.current) {
          testStartTimeRef.current = Date.now();
        }
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [countdownEndsAt]);

  // Synchronized Test Timer
  useEffect(() => {
    if (!isActive || !testEndsAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffMs = testEndsAt - now;
      const remainingSec = Math.max(0, Math.ceil(diffMs / 1000));

      if (testStartTimeRef.current === null) {
        testStartTimeRef.current = now;
      }

      setTimeRemainingSeconds(remainingSec);

      if (remainingSec <= 0 && !isFinishedRef.current) {
        handleSubmit();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, testEndsAt, timerSeconds]);

  // Submit Keystroke Log
  const handleSubmit = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsActive(false);
    setIsSubmitting(true);

    const clientElapsedMs = testStartTimeRef.current
      ? Date.now() - testStartTimeRef.current
      : timerSeconds * 1000;

    socket.emit(
      'submit_keystrokes',
      {
        roomId,
        participantId,
        targetTextId,
        keystrokes: keystrokesRef.current,
        clientElapsedMs,
      },
      (res: { success?: boolean; result?: ScoringResult; error?: string }) => {
        setIsSubmitting(false);
        if (res?.success && res.result) {
          onFinish(res.result);
        } else if (res?.error) {
          console.error('Submission error:', res.error);
        }
      }
    );
  }, [roomId, participantId, targetTextId, timerSeconds, onFinish]);

  // 500ms Progress Heartbeat
  useEffect(() => {
    if (!isActive || isFinishedRef.current) return;

    const interval = setInterval(() => {
      if (!testStartTimeRef.current) return;

      const progress = Math.min(
        100,
        Math.round((typedChars.length / (targetText.length || 1)) * 100)
      );

      const elapsedMin = (Date.now() - testStartTimeRef.current) / 60000;
      const wpmEstimate =
        elapsedMin > 0.05
          ? Math.round((typedChars.length / 5) / elapsedMin)
          : 0;

      socket.emit('heartbeat_progress', {
        roomId,
        participantId,
        progress,
        wpmEstimate,
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isActive, typedChars.length, targetText.length, roomId, participantId]);

  // Blur/Focus & Paste tracking
  useEffect(() => {
    const handleBlur = () => {
      setIsFocused(false);
      if (isActive && testStartTimeRef.current) {
        keystrokesRef.current.push({
          key: '',
          timestamp: Date.now() - testStartTimeRef.current,
          type: 'blur',
        });
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
      if (isActive && testStartTimeRef.current) {
        keystrokesRef.current.push({
          key: '',
          timestamp: Date.now() - testStartTimeRef.current,
          type: 'focus',
        });
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!isActive) return;
      e.preventDefault();
      const pasted = e.clipboardData?.getData('text') || '';
      if (testStartTimeRef.current) {
        keystrokesRef.current.push({
          key: pasted,
          timestamp: Date.now() - testStartTimeRef.current,
          type: 'paste',
        });
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('paste', handlePaste);
    };
  }, [isActive]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isActive || isFinishedRef.current) return;

    if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab') {
      e.preventDefault();
    }

    const timestamp = testStartTimeRef.current
      ? Date.now() - testStartTimeRef.current
      : 0;

    if (e.key === 'Backspace') {
      if (backspaceMode === 'none') return;

      if (e.ctrlKey || e.altKey) {
        keystrokesRef.current.push({ key: 'BackspaceWord', timestamp, type: 'keydown' });
        setTypedChars((prev) => {
          if (prev.length === 0) return prev;
          let idx = prev.length - 1;
          while (idx > 0 && prev[idx - 1] !== ' ') {
            idx--;
          }
          return prev.slice(0, idx);
        });
      } else {
        keystrokesRef.current.push({ key: 'Backspace', timestamp, type: 'keydown' });
        setTypedChars((prev) => prev.slice(0, -1));
      }
      return;
    }

    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    keystrokesRef.current.push({
      key: e.key,
      timestamp,
      type: 'keydown',
    });

    const nextChars = [...typedChars, e.key];
    setTypedChars(nextChars);

    if (nextChars.length >= targetText.length) {
      handleSubmit();
    }
  };

  const focusInput = () => {
    if (textContainerRef.current) {
      textContainerRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [isActive]);

  const correctCount = typedChars.reduce((acc, char, idx) => {
    return char === targetText[idx] ? acc + 1 : acc;
  }, 0);

  const estimatedAcc =
    typedChars.length > 0 ? Math.round((correctCount / typedChars.length) * 100) : 100;

  const elapsedSec = testStartTimeRef.current
    ? (Date.now() - testStartTimeRef.current) / 1000
    : 0;
  const estimatedWpm =
    elapsedSec > 2 ? Math.round((correctCount / 5) / (elapsedSec / 60)) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 select-none relative">
      {/* 3-2-1 Synchronized Countdown Overlay */}
      {countdownRemaining !== null && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center">
          <div className="text-8xl sm:text-9xl font-display font-extrabold text-emerald-400 animate-ping duration-700">
            {countdownRemaining}
          </div>
          <p className="mt-6 text-xs uppercase tracking-widest text-zinc-400 font-mono">
            Get Ready &bull; Starting on zero
          </p>
        </div>
      )}

      {/* Floating HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#111613] border border-[#232F26] p-3 rounded-xl shadow font-mono">
        {/* Timer */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#161D18] rounded-lg border border-[#232F26]">
          <Timer size={18} className="text-emerald-400" />
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase">TIME LEFT</span>
            <span
              className={`text-lg font-bold tabular-nums ${
                timeRemainingSeconds <= 10 ? 'text-amber-400 animate-pulse' : 'text-white'
              }`}
            >
              {String(Math.floor(timeRemainingSeconds / 60)).padStart(2, '0')}:
              {String(timeRemainingSeconds % 60).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Live Net WPM */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#161D18] rounded-lg border border-[#232F26]">
          <Zap size={18} className="text-emerald-400" />
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase">SPEED</span>
            <span className="text-lg font-bold text-white tabular-nums">{estimatedWpm} WPM</span>
          </div>
        </div>

        {/* Live Accuracy */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#161D18] rounded-lg border border-[#232F26]">
          <Target size={18} className="text-emerald-400" />
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase">ACCURACY</span>
            <span
              className={`text-lg font-bold tabular-nums ${
                estimatedAcc < 90 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {estimatedAcc}%
            </span>
          </div>
        </div>

        {/* Characters Progress */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#161D18] rounded-lg border border-[#232F26]">
          <div className="w-full">
            <div className="flex justify-between text-[10px] text-zinc-400 uppercase mb-1">
              <span>PROGRESS</span>
              <span className="tabular-nums">
                {typedChars.length}/{targetText.length}
              </span>
            </div>
            <div className="w-full bg-[#0A0D0B] h-1.5 rounded-full overflow-hidden border border-[#232F26]">
              <div
                className="bg-emerald-500 h-full transition-all duration-150"
                style={{
                  width: `${Math.min(100, (typedChars.length / (targetText.length || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Focus Warning Banner */}
      {!isFocused && isActive && (
        <div className="bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs px-4 py-2 rounded-lg flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-400 shrink-0" />
          <span>Click on the text area below to continue typing.</span>
        </div>
      )}

      {/* HERO TYPING CANVAS */}
      <div
        ref={textContainerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={focusInput}
        className={`relative w-full min-h-[260px] p-8 sm:p-10 rounded-xl bg-[#111613] border outline-none transition-all cursor-text text-xl sm:text-2xl typing-canvas ${
          isActive
            ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.06)]'
            : 'border-[#232F26] opacity-75'
        }`}
      >
        <div className="leading-relaxed tracking-normal select-none">
          {targetText.split('').map((char, index) => {
            const isTyped = index < typedChars.length;
            const isCurrent = index === typedChars.length;
            const isCorrect = isTyped && typedChars[index] === char;
            const isWrong = isTyped && typedChars[index] !== char;

            let charClass = 'text-zinc-500';
            if (isCorrect) {
              charClass = 'text-[#F4F5F4] font-medium';
            } else if (isWrong) {
              charClass = 'text-red-400 bg-red-950/60 rounded underline decoration-red-500';
            }

            return (
              <React.Fragment key={index}>
                {isCurrent && isActive && <span className="typing-caret" />}
                <span className={charClass}>{char}</span>
              </React.Fragment>
            );
          })}
          {typedChars.length >= targetText.length && isActive && (
            <span className="typing-caret" />
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 font-mono px-2">
        <span>Press Backspace to correct errors.</span>
        <span className="text-zinc-400 mt-1 sm:mt-0">
          Code Meet 2026 &bull; SUIET Mukka
        </span>
      </div>
    </div>
  );
};
