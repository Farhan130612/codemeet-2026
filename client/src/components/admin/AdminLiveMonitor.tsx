import React, { useState, useEffect } from 'react';
import { Participant, ScoringResult, RoomSnapshot } from '../../types.js';
import { socket } from '../../socket.js';
import {
  Play,
  RotateCcw,
  Square,
  Lock,
  Unlock,
  AlertTriangle,
  UserX,
  Ban,
  Edit2,
  Tv,
  Search,
  ShieldAlert,
} from 'lucide-react';

interface AdminLiveMonitorProps {
  roomId: string;
  adminToken: string;
  onOpenProjector: (roomId: string) => void;
}

export const AdminLiveMonitor: React.FC<AdminLiveMonitorProps> = ({
  roomId,
  adminToken,
  onOpenProjector,
}) => {
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submissions, setSubmissions] = useState<ScoringResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isStarting, setIsStarting] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<ScoringResult | null>(null);

  const fetchMonitorData = async () => {
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}/monitor`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.snapshot) {
        setSnapshot(data.snapshot);
        setParticipants(data.participants || []);
        setSubmissions(data.submissions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMonitorData();

    // Join Admin Socket monitor
    socket.emit('admin_join_monitor', { roomId }, (res: any) => {
      if (res?.success) {
        setSnapshot(res.snapshot);
        setParticipants(res.participants || []);
        setSubmissions(res.submissions || []);
      }
    });

    const onMonitorUpdate = (data: any) => {
      if (data?.snapshot?.config?.roomId === roomId) {
        setSnapshot(data.snapshot);
        setParticipants(data.participants || []);
        setSubmissions(data.submissions || []);
      }
    };

    socket.on('admin_monitor_update', onMonitorUpdate);
    return () => {
      socket.off('admin_monitor_update', onMonitorUpdate);
    };
  }, [roomId]);

  // Actions
  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    socket.emit('admin_start_test', { roomId }, (res: any) => {
      setIsStarting(false);
      if (res?.error) alert(res.error);
    });
  };

  const handleAbort = () => {
    if (window.confirm('Abort current run? Participants will be returned to lobby.')) {
      socket.emit('admin_abort_run', { roomId });
    }
  };

  const handleToggleLock = () => {
    socket.emit('admin_lock_room', { roomId, locked: !snapshot?.locked });
  };

  const handleResetRoom = () => {
    if (window.confirm('Reset this room for next round? Scores will be cleared.')) {
      socket.emit('admin_reset_room', { roomId });
    }
  };

  const handleKick = (participantId: string, name: string) => {
    if (window.confirm(`Remove ${name} from room?`)) {
      socket.emit('admin_kick_participant', { roomId, participantId });
    }
  };

  const handleBan = (participantId: string, name: string) => {
    const reason = window.prompt(`Ban ${name}? Enter reason:`, 'Tournament rule violation');
    if (reason !== null) {
      socket.emit('admin_ban_participant', { roomId, participantId, reason });
    }
  };

  const handleRename = (participantId: string, currentName: string) => {
    const newName = window.prompt('Rename participant to:', currentName);
    if (newName && newName.trim().length >= 2) {
      socket.emit('admin_rename_participant', { roomId, participantId, newName: newName.trim() });
    }
  };

  const handleResetAttempt = (participantId: string, name: string) => {
    if (window.confirm(`Reset attempt for ${name}?`)) {
      socket.emit('admin_reset_attempt', { roomId, participantId });
    }
  };

  const handleResolveFlag = (decision: 'accept' | 'disqualify' | 'request_retype') => {
    if (!selectedFlag) return;
    socket.emit('admin_resolve_flag', {
      roomId,
      participantId: selectedFlag.participantId,
      decision,
    });
    setSelectedFlag(null);
  };

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.usn && p.usn.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const flaggedSubmissions = submissions.filter((s) => s.flaggedForReview);

  // Counters
  const counters = {
    total: participants.length,
    ready: participants.filter((p) => p.status === 'ready').length,
    typing: participants.filter((p) => p.status === 'typing').length,
    finished: participants.filter((p) => p.status === 'finished').length,
    disconnected: participants.filter((p) => p.status === 'disconnected').length,
    flagged: flaggedSubmissions.length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar: Room Title, Dual Codes, Quick Links */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#111613] border border-[#232F26] rounded-xl shadow">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg font-display text-white">{snapshot?.config.title}</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#161D18] border border-[#232F26] text-emerald-400 font-mono font-bold">
              CODE: {snapshot?.config.roomId}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#161D18] border border-[#232F26] text-white font-mono font-bold">
              ROOM #{snapshot?.config.numericCode}
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            {snapshot?.config.timerSeconds}s timer &bull; {snapshot?.config.minAccuracy}% min accuracy &bull; {snapshot?.config.attemptsPerParticipant} attempt limit
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {snapshot?.state === 'lobby' ? (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-mono text-xs font-semibold tracking-wider transition flex items-center gap-2 cursor-pointer shadow"
            >
              <Play size={14} fill="currentColor" />
              {isStarting ? 'STARTING...' : 'START TEST (3-2-1)'}
            </button>
          ) : snapshot?.state === 'countdown' || snapshot?.state === 'in_progress' ? (
            <button
              onClick={handleAbort}
              className="px-4 py-2 rounded-lg bg-red-950/80 border border-red-700 text-red-200 font-mono text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Square size={13} fill="currentColor" /> ABORT
            </button>
          ) : (
            <button
              onClick={handleResetRoom}
              className="px-4 py-2 rounded-lg bg-[#161D18] border border-[#232F26] hover:border-emerald-500 text-white font-mono text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} /> RESET FOR ROUND 2
            </button>
          )}

          <button
            onClick={handleToggleLock}
            className={`px-3 py-2 rounded-lg border text-xs font-mono font-medium transition flex items-center gap-1 cursor-pointer ${
              snapshot?.locked
                ? 'bg-amber-950/40 border-amber-600 text-amber-300'
                : 'bg-[#161D18] border-[#232F26] text-zinc-400 hover:text-white'
            }`}
          >
            {snapshot?.locked ? <Lock size={13} /> : <Unlock size={13} />}
            {snapshot?.locked ? 'LOCKED' : 'LOCK'}
          </button>

          <button
            onClick={() => onOpenProjector(roomId)}
            className="px-3 py-2 rounded-lg bg-[#161D18] border border-[#232F26] hover:border-emerald-500 text-zinc-300 hover:text-white text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer"
            title="Open Stage Projector Scoreboard"
          >
            <Tv size={14} className="text-emerald-400" />
            PROJECTOR
          </button>
        </div>
      </div>

      {/* Status Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        <div className="bg-[#111613] border border-[#232F26] p-3 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block">JOINED</span>
          <span className="text-xl font-mono font-bold text-white tabular-nums">{counters.total}</span>
        </div>
        <div className="bg-[#111613] border border-[#232F26] p-3 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block">READY</span>
          <span className="text-xl font-mono font-bold text-emerald-400 tabular-nums">{counters.ready}</span>
        </div>
        <div className="bg-[#111613] border border-[#232F26] p-3 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block">TYPING</span>
          <span className="text-xl font-mono font-bold text-blue-400 tabular-nums">{counters.typing}</span>
        </div>
        <div className="bg-[#111613] border border-[#232F26] p-3 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block">FINISHED</span>
          <span className="text-xl font-mono font-bold text-white tabular-nums">{counters.finished}</span>
        </div>
        <div className="bg-[#111613] border border-[#232F26] p-3 rounded-lg">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block">OFFLINE</span>
          <span className="text-xl font-mono font-bold text-zinc-500 tabular-nums">{counters.disconnected}</span>
        </div>
        <div className={`p-3 rounded-lg border ${counters.flagged > 0 ? 'bg-amber-950/40 border-amber-600/70 text-amber-300' : 'bg-[#111613] border-[#232F26]'}`}>
          <span className="text-[10px] font-mono uppercase text-zinc-400 block">FLAGGED</span>
          <span className="text-xl font-mono font-bold tabular-nums">{counters.flagged}</span>
        </div>
      </div>

      {/* Flag Review Banner if any flagged */}
      {flaggedSubmissions.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-600/60 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold text-amber-300 block">
                {flaggedSubmissions.length} Flagged Submission(s)
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Pacing anomaly or paste attempt detected.
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedFlag(flaggedSubmissions[0])}
            className="px-3 py-1.5 rounded bg-amber-500 text-black font-mono text-xs font-semibold hover:bg-amber-400 transition cursor-pointer"
          >
            REVIEW
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or USN..."
            className="w-full bg-[#111613] border border-[#232F26] rounded-lg pl-8 pr-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 outline-none"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['all', 'ready', 'typing', 'finished', 'disconnected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded text-[11px] uppercase transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#18241D] text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Live Participant Table */}
      <div className="bg-[#111613] border border-[#232F26] rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#161D18] text-zinc-400 uppercase border-b border-[#232F26] sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-4">PARTICIPANT</th>
                <th className="py-2.5 px-4">USN NUMBER</th>
                <th className="py-2.5 px-4">STATUS</th>
                <th className="py-2.5 px-4">PROGRESS</th>
                <th className="py-2.5 px-4 text-right">LIVE WPM</th>
                <th className="py-2.5 px-4 text-center">ATTEMPTS</th>
                <th className="py-2.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232D26]">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No participants found.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  const sub = submissions.find((s) => s.participantId === p.id);
                  const isFlagged = sub?.flaggedForReview;
                  return (
                    <tr key={p.id} className="hover:bg-[#161D18]/60 transition">
                      <td className="py-3 px-4 font-sans font-medium text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        {isFlagged && (
                          <span
                            onClick={() => setSelectedFlag(sub!)}
                            className="cursor-pointer text-amber-400"
                            title="Flagged submission"
                          >
                            <ShieldAlert size={14} />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 tracking-wider">
                        {p.usn || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            p.status === 'ready'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60'
                              : p.status === 'typing'
                              ? 'bg-blue-950/60 text-blue-400 border border-blue-800 animate-pulse'
                              : p.status === 'finished'
                              ? 'bg-zinc-800 text-zinc-200'
                              : p.status === 'disconnected'
                              ? 'bg-red-950/40 text-red-400'
                              : 'bg-[#18241D] text-zinc-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-black/60 h-2 rounded-full overflow-hidden border border-[#232D26]">
                            <div
                              className="bg-emerald-500 h-full transition-all duration-200"
                              style={{ width: `${Math.min(100, p.progress)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-zinc-400 tabular-nums w-8">
                            {p.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white tabular-nums">
                        {sub ? sub.netWpm.toFixed(1) : p.currentWpmEstimate || 0}
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums text-zinc-400">
                        {p.attemptsUsed}/{snapshot?.config.attemptsPerParticipant}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-zinc-500">
                          <button
                            onClick={() => handleResetAttempt(p.id, p.name)}
                            className="p-1 hover:text-white rounded cursor-pointer"
                            title="Reset attempt"
                          >
                            <RotateCcw size={13} />
                          </button>
                          <button
                            onClick={() => handleRename(p.id, p.name)}
                            className="p-1 hover:text-white rounded cursor-pointer"
                            title="Rename"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleKick(p.id, p.name)}
                            className="p-1 hover:text-amber-400 rounded cursor-pointer"
                            title="Remove from room"
                          >
                            <UserX size={13} />
                          </button>
                          <button
                            onClick={() => handleBan(p.id, p.name)}
                            className="p-1 hover:text-red-400 rounded cursor-pointer"
                            title="Ban participant"
                          >
                            <Ban size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flag Review Modal */}
      {selectedFlag && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111613] border border-[#232D26] rounded-xl p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center gap-2 text-amber-400 mb-2 font-bold uppercase">
              <ShieldAlert size={18} />
              <span>Flagged Submission Review</span>
            </div>
            <h3 className="text-base font-bold font-sans text-white mb-1">
              Participant: {selectedFlag.participantName}
            </h3>
            <p className="text-zinc-400 mb-4">
              USN: {selectedFlag.usn || 'N/A'} &bull; Net WPM: {selectedFlag.netWpm} &bull; Accuracy: {selectedFlag.accuracy}%
            </p>

            <div className="bg-[#161D18] p-3.5 rounded-lg border border-[#232D26] mb-5 space-y-1.5 text-zinc-300">
              <span className="text-[10px] uppercase text-zinc-400 block mb-1 font-semibold">
                DETECTED ANOMALIES
              </span>
              {selectedFlag.reviewReasons.map((r, i) => (
                <div key={i} className="text-red-400 flex items-start gap-1.5">
                  <span>&bull;</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleResolveFlag('accept')}
                className="py-2 rounded bg-emerald-900/60 border border-emerald-700 hover:bg-emerald-800 text-emerald-200 font-semibold transition cursor-pointer"
              >
                ACCEPT
              </button>
              <button
                onClick={() => handleResolveFlag('request_retype')}
                className="py-2 rounded bg-[#161D18] border border-[#232D26] hover:border-zinc-400 text-white font-semibold transition cursor-pointer"
              >
                RETYPE
              </button>
              <button
                onClick={() => handleResolveFlag('disqualify')}
                className="py-2 rounded bg-red-950/80 border border-red-700 hover:bg-red-900 text-red-200 font-semibold transition cursor-pointer"
              >
                DISQUALIFY
              </button>
            </div>

            <button
              onClick={() => setSelectedFlag(null)}
              className="w-full mt-3 py-2 text-center text-zinc-500 hover:text-white cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
