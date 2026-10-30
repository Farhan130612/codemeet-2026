import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ScoringResult } from '../types.js';
import { Trophy, AlertTriangle, ArrowRight, XCircle } from 'lucide-react';

interface ResultModalProps {
  result: ScoringResult;
  onClose: () => void;
  onToggleReady?: () => void;
  isReady?: boolean;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  onClose,
  onToggleReady,
  isReady,
}) => {
  useEffect(() => {
    if (!result.isDisqualified && (result.rank === 1 || result.rank === 2 || result.rank === 3)) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#10B981', '#FFFFFF', '#34D399'],
      });
    }
  }, [result]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-lg bg-[#111613] border border-[#232F26] rounded-xl p-6 sm:p-8 shadow-2xl relative flex flex-col gap-5 font-mono">
        {/* MODAL HEADER */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-[#161D18] border border-[#232F26] mb-3">
            {result.isDisqualified ? (
              <XCircle size={32} className="text-red-400" />
            ) : (
              <Trophy size={32} className="text-emerald-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            {result.isDisqualified ? 'ATTEMPT DISQUALIFIED' : 'TEST COMPLETE'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {result.participantName} {result.usn && <span className="text-zinc-500">({result.usn})</span>}
          </p>
        </div>

        {/* PRIMARY METRICS CALLOUT */}
        <div className="grid grid-cols-2 gap-3 bg-[#161D18] p-4 rounded-lg border border-[#232F26] text-center">
          <div className="border-r border-[#232F26] pr-2">
            <span className="text-[10px] text-zinc-400 uppercase block">NET WPM</span>
            <span
              className={`text-4xl sm:text-5xl font-extrabold tabular-nums ${
                result.isDisqualified ? 'text-red-400 line-through' : 'text-emerald-400'
              }`}
            >
              {result.netWpm.toFixed(1)}
            </span>
          </div>
          <div className="pl-2">
            <span className="text-[10px] text-zinc-400 uppercase block">ACCURACY</span>
            <span
              className={`text-4xl sm:text-5xl font-extrabold tabular-nums ${
                result.accuracy < 90 ? 'text-amber-400' : 'text-white'
              }`}
            >
              {result.accuracy.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* DETAILED STATS */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-[#161D18]/60 p-2.5 rounded border border-[#232F26]">
            <span className="text-zinc-500 block text-[10px]">RAW SPEED</span>
            <span className="text-white font-bold tabular-nums">{result.rawWpm.toFixed(1)}</span>
          </div>
          <div className="bg-[#161D18]/60 p-2.5 rounded border border-[#232F26]">
            <span className="text-zinc-500 block text-[10px]">CORRECT CHARS</span>
            <span className="text-emerald-400 font-bold tabular-nums">{result.correctCharacters}</span>
          </div>
          <div className="bg-[#161D18]/60 p-2.5 rounded border border-[#232F26]">
            <span className="text-zinc-500 block text-[10px]">ERRORS</span>
            <span className="text-red-400 font-bold tabular-nums">{result.uncorrectedErrors}</span>
          </div>
          <div className="bg-[#161D18]/60 p-2.5 rounded border border-[#232F26]">
            <span className="text-zinc-500 block text-[10px]">CORRECTED ERR</span>
            <span className="text-white font-bold tabular-nums">{result.correctedErrors}</span>
          </div>
          <div className="bg-[#161D18]/60 p-2.5 rounded border border-[#232F26]">
            <span className="text-zinc-500 block text-[10px]">CONSISTENCY</span>
            <span className="text-white font-bold tabular-nums">{result.consistency}%</span>
          </div>
          <div className="bg-[#161D18]/60 p-2.5 rounded border border-[#232F26]">
            <span className="text-zinc-500 block text-[10px]">RANK</span>
            <span className="text-white font-bold tabular-nums">
              {result.rank ? `#${result.rank}` : '-'}
            </span>
          </div>
        </div>

        {/* DISQUALIFICATION WARNING IF ANY */}
        {result.isDisqualified && (
          <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0 text-red-400" />
            <span>{result.disqualificationReason || 'Score is below accuracy threshold.'}</span>
          </div>
        )}

        {/* MODAL ACTIONS */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs tracking-wide transition cursor-pointer"
          >
            VIEW LEADERBOARD
          </button>
          {onToggleReady && (
            <button
              onClick={onToggleReady}
              className={`px-5 py-3 rounded-lg text-xs font-semibold tracking-wide border transition cursor-pointer ${
                isReady
                  ? 'bg-[#161D18] text-zinc-400 border-[#232F26]'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
              }`}
            >
              {isReady ? 'WAITING' : 'READY FOR NEXT ROUND'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
