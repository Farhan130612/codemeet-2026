import React, { useState } from 'react';
import { RoomSnapshot } from '../types.js';
import { socket } from '../socket.js';
import {
  Play,
  RotateCcw,
  Lock,
  Unlock,
  UserX,
  Download,
  Share2,
  Copy,
  Check,
  Shield,
  Users,
  Timer,
  FileSpreadsheet,
} from 'lucide-react';

interface HostDashboardProps {
  snapshot: RoomSnapshot;
  hostToken: string;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({ snapshot, hostToken }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

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

  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    socket.emit('host_start', { roomId: snapshot.config.roomId, hostToken }, (res: any) => {
      setIsStarting(false);
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  const handleToggleLock = () => {
    socket.emit('host_lock', {
      roomId: snapshot.config.roomId,
      hostToken,
      locked: !snapshot.locked,
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset this room for the next round? All current progress will reset.')) {
      socket.emit('host_reset', { roomId: snapshot.config.roomId, hostToken });
    }
  };

  const handleKick = (participantId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from this room?`)) {
      socket.emit('host_kick', {
        roomId: snapshot.config.roomId,
        hostToken,
        participantId,
      });
    }
  };

  const downloadCsv = () => {
    window.open(`/api/rooms/${snapshot.config.roomId}/export.csv`, '_blank');
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* HOST HERO ACTION BAR */}
      <div className="bg-dark-surface border-2 border-lime/40 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-lime" size={20} />
            <span className="text-xs font-mono font-bold tracking-widest text-lime uppercase">
              HOST CONTROL COMMAND
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {snapshot.config.title}
          </h2>
          <p className="text-xs font-mono text-typo-muted mt-1">
            Timer: {snapshot.config.timerSeconds}s &bull; Min Accuracy: {snapshot.config.minAccuracy}% &bull; Attempts: {snapshot.config.attemptsPerParticipant}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {snapshot.state === 'lobby' ? (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-lime text-black font-extrabold font-mono text-sm tracking-wider hover:bg-lime-hover shadow-[0_0_20px_rgba(198,255,0,0.4)] transition transform active:scale-95 cursor-pointer"
            >
              <Play size={18} fill="currentColor" />
              {isStarting ? 'STARTING...' : 'START TEST FOR EVERYONE'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="bg-dark-card border border-lime text-lime px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase">
                {snapshot.state === 'countdown' ? 'COUNTDOWN IN PROGRESS' : 'TEST UNDERWAY'}
              </span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border hover:border-lime text-typo-muted hover:text-white text-xs font-mono transition"
                title="Reset round"
              >
                <RotateCcw size={15} /> RESET ROUND
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ROOM CONTROLS & SHARE BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Room Code & Copy */}
        <div className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-typo-muted font-mono uppercase block">ROOM CODE</span>
            <span className="text-xl font-extrabold font-mono text-lime tracking-widest">
              {snapshot.config.roomId}
            </span>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-1 text-xs font-mono bg-dark-card border border-dark-border hover:border-lime px-3 py-1.5 rounded-lg text-white transition"
          >
            {copiedCode ? <Check size={14} className="text-lime" /> : <Copy size={14} />}
            {copiedCode ? 'COPIED' : 'COPY'}
          </button>
        </div>

        {/* Share Invite Link */}
        <div className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="text-[10px] text-typo-muted font-mono uppercase block">INVITE LINK</span>
            <span className="text-xs font-mono text-typo-muted truncate block">
              {inviteUrl}
            </span>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1 text-xs font-mono bg-dark-card border border-dark-border hover:border-lime px-3 py-1.5 rounded-lg text-white transition whitespace-nowrap"
          >
            {copiedLink ? <Check size={14} className="text-lime" /> : <Share2 size={14} />}
            {copiedLink ? 'COPIED' : 'SHARE'}
          </button>
        </div>

        {/* Room Locking & CSV Export */}
        <div className="bg-dark-surface border border-dark-border p-4 rounded-xl flex items-center justify-between gap-2">
          <button
            onClick={handleToggleLock}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-mono py-2 rounded-lg border transition ${
              snapshot.locked
                ? 'bg-amber-950/40 border-amber-600 text-amber-300'
                : 'bg-dark-card border-dark-border text-typo-muted hover:text-white'
            }`}
          >
            {snapshot.locked ? <Lock size={14} /> : <Unlock size={14} />}
            {snapshot.locked ? 'LOCKED' : 'LOCK ROOM'}
          </button>

          <button
            onClick={downloadCsv}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-mono bg-dark-card border border-dark-border hover:border-lime py-2 rounded-lg text-white transition"
            title="Download CSV Results"
          >
            <Download size={14} className="text-lime" />
            CSV EXPORT
          </button>
        </div>
      </div>

      {/* PARTICIPANT MANAGEMENT ROSTER */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-dark-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="text-lime" size={18} />
            <h3 className="font-display font-bold text-lg text-white">
              PARTICIPANTS ROSTER ({snapshot.participants.length}/{snapshot.config.maxParticipants})
            </h3>
          </div>
          <span className="text-xs font-mono text-typo-muted">
            Host can remove disruptive participants at any time
          </span>
        </div>

        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-dark-card text-typo-muted uppercase border-b border-dark-border sticky top-0">
              <tr>
                <th className="py-2.5 px-4">TYPIST NAME</th>
                <th className="py-2.5 px-4">STATUS</th>
                <th className="py-2.5 px-4 text-center">PROGRESS</th>
                <th className="py-2.5 px-4 text-center">ATTEMPTS</th>
                <th className="py-2.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {snapshot.participants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-typo-muted">
                    No participants have joined yet. Share the code or invite link above.
                  </td>
                </tr>
              ) : (
                snapshot.participants.map((p) => (
                  <tr key={p.id} className="hover:bg-dark-card/40 transition">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.isHost && (
                        <span className="text-[10px] bg-lime/10 text-lime px-1.5 py-0.5 rounded border border-lime/30">
                          HOST
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          p.status === 'ready'
                            ? 'bg-lime/20 text-lime'
                            : p.status === 'typing'
                            ? 'bg-blue-950/60 text-blue-400 animate-pulse'
                            : p.status === 'finished'
                            ? 'bg-emerald-950/60 text-emerald-400'
                            : p.status === 'disconnected'
                            ? 'bg-red-950/60 text-red-400'
                            : 'bg-dark-card text-typo-muted'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-white font-medium">{p.progress}%</span>
                    </td>
                    <td className="py-3 px-4 text-center text-typo-muted">
                      {p.attemptsUsed}/{snapshot.config.attemptsPerParticipant}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!p.isHost && (
                        <button
                          onClick={() => handleKick(p.id, p.name)}
                          className="p-1.5 rounded hover:bg-red-950/50 hover:text-red-400 text-typo-muted transition"
                          title="Remove participant"
                        >
                          <UserX size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
