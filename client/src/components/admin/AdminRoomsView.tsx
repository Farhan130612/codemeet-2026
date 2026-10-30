import React, { useState, useEffect } from 'react';
import { Plus, Copy, Check, ExternalLink, Trash2, RefreshCw, Layers } from 'lucide-react';

interface RoomSummary {
  roomId: string;
  numericCode: string;
  title: string;
  state: string;
  timerSeconds: number;
  participantsCount: number;
  submissionsCount: number;
  locked: boolean;
}

interface AdminRoomsViewProps {
  adminToken: string;
  onSelectRoom: (roomId: string) => void;
}

export const AdminRoomsView: React.FC<AdminRoomsViewProps> = ({
  adminToken,
  onSelectRoom,
}) => {
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('Code Meet 2026 Speed Typer');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [attempts, setAttempts] = useState(1);
  const [minAccuracy, setMinAccuracy] = useState(90);
  const [hasPunctuation, setHasPunctuation] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/admin/rooms', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.rooms) {
        setRooms(data.rooms);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title,
          timerSeconds,
          attemptsPerParticipant: attempts,
          minAccuracy,
          hasPunctuation,
          hasNumbers,
        }),
      });

      const data = await res.json();
      if (data.success && data.code) {
        setShowCreateModal(false);
        fetchRooms();
        onSelectRoom(data.code);
      }
    } catch (err) {
      alert('Failed to create room.');
    }
  };

  const handleDuplicate = async (roomId: string) => {
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchRooms();
      }
    } catch {}
  };

  const handleDelete = async (roomId: string) => {
    if (!window.confirm(`Delete room ${roomId}?`)) return;
    try {
      await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      fetchRooms();
    } catch {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232F26]">
        <div>
          <h2 className="text-xl font-bold font-display text-white">ROOMS & ARENAS</h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Create and manage competition rooms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRooms}
            className="p-2 rounded-lg bg-[#111613] border border-[#232F26] hover:border-zinc-500 text-zinc-400 hover:text-white text-xs transition cursor-pointer"
            title="Refresh room list"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-mono text-xs font-semibold transition cursor-pointer shadow"
          >
            <Plus size={14} /> CREATE ROOM
          </button>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-[#111613] border border-[#232F26] rounded-xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#161D18] text-zinc-400 uppercase border-b border-[#232F26]">
              <tr>
                <th className="py-3 px-4">ROOM TITLE</th>
                <th className="py-3 px-4">ROOM CODES</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-center">TIMER</th>
                <th className="py-3 px-4 text-center">PARTICIPANTS</th>
                <th className="py-3 px-4 text-center">SUBMISSIONS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232F26]">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    {isLoading ? 'Loading active rooms...' : 'No rooms created yet. Click "Create Room" to begin.'}
                  </td>
                </tr>
              ) : (
                rooms.map((r) => (
                  <tr key={r.roomId} className="hover:bg-[#161D18]/70 transition">
                    <td className="py-3.5 px-4 font-sans font-semibold text-white">
                      <div>{r.title}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white tracking-widest">{r.roomId}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#18241D] text-emerald-400 border border-emerald-500/30">
                          #{r.numericCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(r.roomId)}
                          className="text-zinc-500 hover:text-white"
                          title="Copy Code"
                        >
                          {copiedCode === r.roomId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          r.state === 'in_progress'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800 animate-pulse'
                            : r.state === 'countdown'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                            : r.state === 'ended'
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60'
                        }`}
                      >
                        {r.state}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center tabular-nums text-zinc-300">
                      {r.timerSeconds}s
                    </td>
                    <td className="py-3.5 px-4 text-center tabular-nums text-white font-medium">
                      {r.participantsCount}
                    </td>
                    <td className="py-3.5 px-4 text-center tabular-nums text-zinc-400">
                      {r.submissionsCount}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectRoom(r.roomId)}
                          className="px-2.5 py-1 rounded bg-[#161D18] hover:bg-[#18241D] border border-[#232F26] hover:border-emerald-500 text-white text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink size={12} /> OPEN
                        </button>
                        <button
                          onClick={() => handleDuplicate(r.roomId)}
                          className="p-1 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition cursor-pointer"
                          title="Duplicate room settings"
                        >
                          <Layers size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.roomId)}
                          className="p-1 rounded hover:bg-red-950/50 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                          title="Delete room"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111613] border border-[#232F26] rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-1">Create Competition Room</h3>
            <p className="text-xs font-mono text-zinc-400 mb-5">
              Set room parameters for this competition round.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-zinc-400 block uppercase mb-1">ROOM TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#161D18] border border-[#232F26] rounded px-3 py-2 text-white font-sans text-sm focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block uppercase mb-1">TIMER</label>
                  <select
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(Number(e.target.value))}
                    className="w-full bg-[#161D18] border border-[#232F26] rounded px-2.5 py-2 text-white outline-none focus:border-emerald-500"
                  >
                    <option value={15}>15 Seconds</option>
                    <option value={30}>30 Seconds</option>
                    <option value={60}>60 Seconds</option>
                    <option value={120}>120 Seconds</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 block uppercase mb-1">ATTEMPTS</label>
                  <select
                    value={attempts}
                    onChange={(e) => setAttempts(Number(e.target.value))}
                    className="w-full bg-[#161D18] border border-[#232F26] rounded px-2.5 py-2 text-white outline-none focus:border-emerald-500"
                  >
                    <option value={1}>1 Attempt</option>
                    <option value={2}>2 Attempts</option>
                    <option value={3}>3 Attempts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block uppercase mb-1">
                  MINIMUM ACCURACY THRESHOLD ({minAccuracy}%)
                </label>
                <input
                  type="range"
                  min={70}
                  max={98}
                  step={1}
                  value={minAccuracy}
                  onChange={(e) => setMinAccuracy(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={hasPunctuation}
                    onChange={(e) => setHasPunctuation(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span>Punctuation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={hasNumbers}
                    onChange={(e) => setHasNumbers(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span>Numbers</span>
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#232F26]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded bg-[#161D18] border border-[#232F26] text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition cursor-pointer shadow"
                >
                  CREATE ROOM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
