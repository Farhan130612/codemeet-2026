import React, { useState } from 'react';
import { CodeMeetLogo } from '../CodeMeetLogo.js';
import { AdminRoomsView } from './AdminRoomsView.js';
import { AdminLiveMonitor } from './AdminLiveMonitor.js';
import { AdminEventLog } from './AdminEventLog.js';
import { AdminSystemHealth } from './AdminSystemHealth.js';
import { LiveLeaderboard } from '../LiveLeaderboard.js';
import {
  Layers,
  Activity,
  Trophy,
  Server,
  LogOut,
  Radio,
  Tv,
} from 'lucide-react';

interface AdminDashboardProps {
  adminToken: string;
  onLogout: () => void;
  onOpenProjector: (roomId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminToken,
  onLogout,
  onOpenProjector,
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'monitor' | 'leaderboard' | 'audit' | 'health'>('rooms');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('monitor');
  };

  return (
    <div className="min-h-screen bg-[#0A0D0B] text-[#F4F5F4] flex flex-col md:flex-row font-display selection:bg-emerald-500 selection:text-black">
      {/* PERSISTENT LEFT SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#111613] border-r border-[#232F26] flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#232F26]">
          <CodeMeetLogo size="md" showWebflow={true} />
        </div>

        {/* Navigation Items */}
        <nav className="p-3 flex-1 flex flex-col gap-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition ${
              activeTab === 'rooms'
                ? 'bg-[#18241D] text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-[#161D18]'
            }`}
          >
            <Layers size={16} className={activeTab === 'rooms' ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>ROOMS & ARENAS</span>
          </button>

          <button
            onClick={() => setActiveTab('monitor')}
            disabled={!selectedRoomId}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition ${
              activeTab === 'monitor'
                ? 'bg-[#18241D] text-emerald-400 border border-emerald-500/30 font-semibold'
                : !selectedRoomId
                ? 'opacity-40 cursor-not-allowed text-zinc-600'
                : 'text-zinc-400 hover:text-white hover:bg-[#161D18]'
            }`}
          >
            <Radio size={16} className={activeTab === 'monitor' ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>LIVE MONITOR</span>
            {selectedRoomId && (
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            disabled={!selectedRoomId}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition ${
              activeTab === 'leaderboard'
                ? 'bg-[#18241D] text-emerald-400 border border-emerald-500/30 font-semibold'
                : !selectedRoomId
                ? 'opacity-40 cursor-not-allowed text-zinc-600'
                : 'text-zinc-400 hover:text-white hover:bg-[#161D18]'
            }`}
          >
            <Trophy size={16} className={activeTab === 'leaderboard' ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>LEADERBOARD</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition ${
              activeTab === 'audit'
                ? 'bg-[#18241D] text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-[#161D18]'
            }`}
          >
            <Activity size={16} className={activeTab === 'audit' ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>EVENT LOG</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition ${
              activeTab === 'health'
                ? 'bg-[#18241D] text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-[#161D18]'
            }`}
          >
            <Server size={16} className={activeTab === 'health' ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>SYSTEM HEALTH</span>
          </button>
        </nav>

        {/* Sidebar Footer & Logout */}
        <div className="p-4 border-t border-[#232F26]">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#161D18] border border-[#232F26] hover:border-zinc-500 text-zinc-400 hover:text-white font-mono text-xs transition"
          >
            <LogOut size={13} />
            <span>SIGN OUT</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONSOLE */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Status Bar */}
        <header className="h-14 border-b border-[#232F26] bg-[#0E1310] px-6 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 uppercase tracking-wider">ACTIVE ROOM:</span>
            {selectedRoomId ? (
              <span className="text-emerald-400 font-bold tracking-widest bg-[#161D18] px-2.5 py-1 rounded border border-[#232F26]">
                {selectedRoomId}
              </span>
            ) : (
              <span className="text-zinc-500">None selected (select from Rooms)</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {selectedRoomId && (
              <button
                onClick={() => onOpenProjector(selectedRoomId)}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#161D18] border border-[#232F26] hover:border-emerald-500 text-white transition"
              >
                <Tv size={13} className="text-emerald-400" />
                <span>PROJECTOR</span>
              </button>
            )}
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ADMIN ACTIVE
            </span>
          </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'rooms' && (
            <AdminRoomsView adminToken={adminToken} onSelectRoom={handleSelectRoom} />
          )}

          {activeTab === 'monitor' && selectedRoomId && (
            <AdminLiveMonitor
              roomId={selectedRoomId}
              adminToken={adminToken}
              onOpenProjector={onOpenProjector}
            />
          )}

          {activeTab === 'leaderboard' && selectedRoomId && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#232F26]">
                <div>
                  <h2 className="text-xl font-bold font-display text-white">LEADERBOARD</h2>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Room {selectedRoomId} &bull; Ranked by server-verified Net WPM
                  </p>
                </div>
                <button
                  onClick={() => window.open(`/api/rooms/${selectedRoomId}/export.csv`, '_blank')}
                  className="px-3.5 py-2 rounded-lg bg-[#161D18] border border-[#232F26] hover:border-emerald-500 text-white font-mono text-xs font-semibold transition"
                >
                  EXPORT CSV
                </button>
              </div>
              <LiveLeaderboard leaderboard={[]} minAccuracy={90} />
            </div>
          )}

          {activeTab === 'audit' && (
            <AdminEventLog adminToken={adminToken} activeRoomId={selectedRoomId || undefined} />
          )}

          {activeTab === 'health' && (
            <AdminSystemHealth adminToken={adminToken} />
          )}
        </div>
      </main>
    </div>
  );
};
