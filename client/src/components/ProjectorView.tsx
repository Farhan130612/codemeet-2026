import React, { useState, useEffect } from 'react';
import { RoomSnapshot } from '../types.js';
import { CodeMeetLogo } from './CodeMeetLogo.js';
import { Trophy, Maximize, Minimize, Timer, Flag, Zap, Users } from 'lucide-react';

interface ProjectorViewProps {
  snapshot: RoomSnapshot;
  onExit?: () => void;
}

export const ProjectorView: React.FC<ProjectorViewProps> = ({ snapshot, onExit }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    if (!snapshot.testEndsAt) {
      setSecondsRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((snapshot.testEndsAt! - now) / 1000));
      setSecondsRemaining(diff);
    }, 200);

    return () => clearInterval(interval);
  }, [snapshot.testEndsAt]);

  const activeTypists = snapshot.participants.filter(
    (p) => p.status === 'typing' || p.status === 'finished'
  );

  const qualifiedLeaderboard = snapshot.leaderboard.filter((r) => !r.isDisqualified);
  const top3 = qualifiedLeaderboard.slice(0, 3);

  return (
    <div className="fixed inset-0 bg-[#0A0D0B] text-white z-50 flex flex-col p-6 sm:p-10 select-none overflow-hidden font-display selection:bg-emerald-500 selection:text-black">
      {/* PROJECTOR HEADER */}
      <div className="flex items-center justify-between border-b border-[#232F26] pb-6">
        <div className="flex items-center space-x-6">
          <CodeMeetLogo size="lg" showWebflow={true} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-white">
                Speed Typing <span className="text-emerald-400">Championship</span>
              </h1>
              <span className="bg-[#161D18] border border-[#232F26] text-emerald-400 font-mono text-xs px-2.5 py-1 rounded uppercase tracking-wider font-semibold">
                STAGE BROADCAST
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 tracking-wider mt-1">
              Srinivas University (SUIET, Mukka) &bull; Room Code: <span className="text-white font-bold">{snapshot.config.roomId}</span> &bull; Room Number: <span className="text-emerald-400 font-bold">#{snapshot.config.numericCode}</span>
            </p>
          </div>
        </div>

        {/* Center Clock / State */}
        <div className="flex items-center gap-4">
          {snapshot.state === 'countdown' ? (
            <div className="bg-emerald-500 text-black font-extrabold font-mono text-xl px-5 py-2 rounded-lg animate-pulse">
              STARTING IN 3 SECONDS...
            </div>
          ) : snapshot.state === 'in_progress' ? (
            <div className="flex items-center gap-3 bg-[#111613] border-2 border-emerald-500 px-5 py-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Timer className="text-emerald-400" size={24} />
              <div className="font-mono text-2xl font-bold text-white tabular-nums">
                {secondsRemaining !== null
                  ? `${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(
                      secondsRemaining % 60
                    ).padStart(2, '0')}`
                  : `${snapshot.config.timerSeconds}s`}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#111613] border border-[#232F26] px-4 py-2 rounded-lg text-zinc-400 font-mono text-sm">
              <Users size={16} className="text-emerald-400" />
              <span className="tabular-nums">{snapshot.participants.length} Participants in Lobby</span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-lg bg-[#111613] border border-[#232F26] hover:border-zinc-500 text-zinc-400 hover:text-white transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-2 rounded border border-[#232F26]"
            >
              EXIT
            </button>
          )}
        </div>
      </div>

      {/* MAIN PROJECTOR CONTENT GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 min-h-0">
        {/* LEFT COLUMN: TOP 3 PODIUM & STANDINGS */}
        <div className="lg:col-span-5 flex flex-col gap-6 min-h-0">
          <div className="flex items-center justify-between border-b border-[#232F26] pb-3">
            <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Trophy className="text-emerald-400" size={20} />
              PODIUM STANDINGS
            </h2>
            <span className="text-xs font-mono text-zinc-400">NET WPM</span>
          </div>

          <div className="flex flex-col gap-3">
            {top3.map((res, idx) => {
              const isFirst = idx === 0;
              return (
                <div
                  key={res.participantId}
                  className={`p-4 rounded-xl flex items-center justify-between ${
                    isFirst
                      ? 'bg-gradient-to-r from-[#18241D] to-[#111613] border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
                      : 'bg-[#111613] border border-[#232F26]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-9 h-9 rounded-lg font-mono font-extrabold flex items-center justify-center text-lg ${
                        isFirst
                          ? 'bg-emerald-500 text-black shadow'
                          : idx === 1
                          ? 'bg-slate-300 text-black'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold font-display text-white truncate max-w-[200px]">
                        {res.participantName}
                      </h3>
                      <p className="text-xs font-mono text-zinc-400">
                        {res.usn && <span className="mr-2 text-zinc-500">{res.usn}</span>}
                        Acc: <strong className="text-white tabular-nums">{res.accuracy}%</strong>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
                      {res.netWpm.toFixed(1)}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">WPM</div>
                  </div>
                </div>
              );
            })}

            {top3.length === 0 && (
              <div className="p-8 border border-dashed border-[#232F26] rounded-xl text-center text-sm font-mono text-zinc-500">
                Podium will populate as typists submit.
              </div>
            )}
          </div>

          {/* Quick Roster Standings Table */}
          <div className="flex-1 bg-[#111613] border border-[#232F26] rounded-xl p-4 overflow-y-auto min-h-0">
            <h4 className="text-xs font-mono uppercase text-zinc-400 mb-3 font-semibold">
              Live Standings Roster
            </h4>
            <div className="space-y-2">
              {qualifiedLeaderboard.slice(3, 15).map((res) => (
                <div
                  key={res.participantId}
                  className="flex items-center justify-between text-xs font-mono py-1.5 px-2 rounded hover:bg-[#161D18]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 w-6">#{res.rank}</span>
                    <span className="text-white font-medium">{res.participantName}</span>
                    {res.usn && <span className="text-[10px] text-zinc-400">({res.usn})</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400 tabular-nums">{res.accuracy}%</span>
                    <span className="text-white font-bold tabular-nums">{res.netWpm.toFixed(1)} WPM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME TYPIST PROGRESS LANES */}
        <div className="lg:col-span-7 flex flex-col bg-[#111613] border border-[#232F26] rounded-xl p-6 min-h-0">
          <div className="flex items-center justify-between border-b border-[#232F26] pb-3 mb-4">
            <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Zap className="text-emerald-400" size={20} />
              LIVE RACER TRACK
            </h2>
            <span className="text-xs font-mono text-zinc-400 font-semibold tabular-nums">
              {activeTypists.length} Typists Racing
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {activeTypists.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 font-mono text-sm py-16">
                <Flag size={28} className="text-zinc-600 mb-3" />
                Waiting for host to begin test...
              </div>
            ) : (
              activeTypists.map((p) => {
                const isFinished = p.status === 'finished';
                return (
                  <div key={p.id} className="bg-[#161D18] border border-[#232F26] p-3 rounded-lg">
                    <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        {p.usn && <span className="text-[10px] text-zinc-400">({p.usn})</span>}
                        {isFinished && (
                          <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                            DONE
                          </span>
                        )}
                      </div>
                      <div className="text-zinc-400">
                        Speed: <span className="text-white font-bold tabular-nums">{p.currentWpmEstimate || 0} WPM</span> &bull; <span className="tabular-nums">{p.progress}%</span>
                      </div>
                    </div>
                    {/* Racer track */}
                    <div className="w-full bg-[#0A0D0B] h-2 rounded-full overflow-hidden border border-[#232D26]">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.max(2, p.progress)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* FOOTER TICKER */}
      <div className="border-t border-[#232F26] pt-4 flex justify-between items-center text-xs font-mono text-zinc-500">
        <span>Srinivas University Institute of Engineering and Technology &bull; Mukka</span>
        <span className="text-emerald-400">Code Meet 2026</span>
      </div>
    </div>
  );
};
