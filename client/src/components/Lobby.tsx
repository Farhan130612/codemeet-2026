import React, { useState } from 'react';
import { RoomSnapshot, Participant } from '../types.js';
import { socket } from '../socket.js';
import { Users, CheckCircle2, Clock, Share2, Copy, Check, ShieldCheck } from 'lucide-react';

interface LobbyProps {
  snapshot: RoomSnapshot;
  currentParticipant: Participant;
}

export const Lobby: React.FC<LobbyProps> = ({
  snapshot,
  currentParticipant,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const inviteUrl = `${window.location.origin}/?room=${snapshot.config.roomId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(snapshot.config.roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleReady = () => {
    const isNowReady = currentParticipant.status !== 'ready';
    socket.emit('toggle_ready', {
      roomId: snapshot.config.roomId,
      participantId: currentParticipant.id,
      isReady: isNowReady,
    });
  };

  const isReady = currentParticipant.status === 'ready';
  const readyCount = snapshot.participants.filter((p) => p.status === 'ready').length;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* LOBBY HERO BANNER */}
      <div className="bg-[#111613] border border-[#232F26] p-6 sm:p-8 rounded-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] uppercase tracking-widest mb-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LOBBY OPEN &bull; AWAITING HOST START
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            {snapshot.config.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-zinc-400">
            <span>Duration: <strong className="text-white">{snapshot.config.timerSeconds}s</strong></span>
            <span>&bull;</span>
            <span>Min Accuracy: <strong className="text-emerald-400">{snapshot.config.minAccuracy}%</strong></span>
            <span>&bull;</span>
            <span>Attempts: <strong className="text-white">{snapshot.config.attemptsPerParticipant}</strong></span>
          </div>
        </div>

        {/* Ready Toggle Button */}
        <button
          onClick={handleToggleReady}
          className={`w-full sm:w-auto px-7 py-3.5 rounded-lg font-mono text-xs font-bold tracking-wider border transition transform active:scale-95 cursor-pointer shadow flex items-center justify-center gap-2 ${
            isReady
              ? 'bg-emerald-500 text-black border-emerald-400'
              : 'bg-[#161D18] text-zinc-300 border-[#232F26] hover:border-zinc-500 hover:text-white'
          }`}
        >
          <CheckCircle2 size={16} />
          {isReady ? "READY" : "I'M READY"}
        </button>
      </div>

      {/* PARTICIPANT CREDENTIALS & SHARE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-[#111613] border border-[#232F26] p-3.5 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">YOUR USN</span>
            <span className="text-sm font-bold text-white tracking-wider">
              {currentParticipant.usn || 'NOT SPECIFIED'}
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161D18] text-zinc-400 border border-[#232F26]">
            REGISTERED
          </span>
        </div>

        <div className="bg-[#111613] border border-[#232F26] p-3.5 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block">ROOM NUMBER</span>
            <span className="text-sm font-bold text-emerald-400 tracking-wider">
              #{snapshot.config.numericCode || snapshot.config.roomId.slice(0, 6)}
            </span>
          </div>
          <button
            onClick={copyCode}
            className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px]"
          >
            {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copiedCode ? 'COPIED' : 'CODE'}
          </button>
        </div>

        <div className="bg-[#111613] border border-[#232F26] p-3.5 rounded-lg flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="text-[10px] text-zinc-500 uppercase block">INVITE LINK</span>
            <span className="text-zinc-500 truncate block text-[11px]">{inviteUrl}</span>
          </div>
          <button
            onClick={copyLink}
            className="text-zinc-400 hover:text-white text-[11px] flex items-center gap-1 whitespace-nowrap"
          >
            {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
            {copiedLink ? 'COPIED' : 'SHARE'}
          </button>
        </div>
      </div>

      {/* PARTICIPANTS ROSTER */}
      <div className="bg-[#111613] border border-[#232F26] rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#232F26] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="text-emerald-400" size={16} />
            <h3 className="font-display font-bold text-sm text-white">
              PARTICIPANTS ({snapshot.participants.length})
            </h3>
          </div>
          <div className="text-xs font-mono text-emerald-400 font-semibold tabular-nums">
            {readyCount} of {snapshot.participants.length} Ready
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {snapshot.participants.map((p) => {
            const isCurrent = p.id === currentParticipant.id;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-lg border flex items-center justify-between font-mono text-xs transition ${
                  isCurrent
                    ? 'bg-[#18241D] border-emerald-500/40'
                    : 'bg-[#161D18] border-[#232F26]'
                }`}
              >
                <div className="flex flex-col truncate mr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white truncate">{p.name}</span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500 text-black font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  {p.usn && <span className="text-[10px] text-zinc-400">{p.usn}</span>}
                </div>

                <div>
                  {p.status === 'ready' ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                      <CheckCircle2 size={13} /> READY
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Clock size={13} /> WAITING
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RULES SUMMARY */}
      <div className="bg-[#111613] border border-[#232F26] p-4 rounded-xl font-mono text-xs text-zinc-400 space-y-1.5">
        <div className="text-white font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" /> RULES & GUIDELINES
        </div>
        <p>&bull; Target text is revealed automatically at the zero mark of the 3-2-1 countdown.</p>
        <p>&bull; Scoring is computed server-side from raw keystroke logs. Minimum accuracy required is {snapshot.config.minAccuracy}%.</p>
        <p>&bull; Keep this browser tab active throughout the test.</p>
      </div>
    </div>
  );
};
