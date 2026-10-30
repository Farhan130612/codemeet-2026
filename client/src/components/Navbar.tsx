import React from 'react';
import { CodeMeetLogo } from './CodeMeetLogo.js';
import { WifiOff, Copy, Check, Tv } from 'lucide-react';

interface NavbarProps {
  roomCode?: string;
  isConnected: boolean;
  onOpenProjector?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  isConnected,
  onOpenProjector,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-[#232F26] bg-[#0A0D0B]/95 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Official Logos: Code Meet & Webflow */}
        <CodeMeetLogo size="md" showWebflow={true} />

        {/* Center: Active Room Pill (If inside room) */}
        {roomCode && (
          <div className="flex items-center space-x-2 bg-[#111613] border border-[#232F26] px-3.5 py-1.5 rounded-lg shadow-inner">
            <span className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider">ROOM:</span>
            <span className="text-sm font-mono font-bold text-white tracking-widest">{roomCode}</span>
            <button
              onClick={copyRoomCode}
              title="Copy Room Code"
              className="ml-1 p-1 hover:text-white text-zinc-400 transition"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
        )}

        {/* Right Status */}
        <div className="flex items-center space-x-3">
          {roomCode && onOpenProjector && (
            <button
              onClick={onOpenProjector}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111613] border border-[#232F26] hover:border-zinc-500 text-zinc-300 text-xs font-mono transition"
              title="Open Stage Projector Scoreboard"
            >
              <Tv size={14} className="text-emerald-400" />
              <span>PROJECTOR</span>
            </button>
          )}

          {/* Connection Status */}
          <div className="flex items-center space-x-1.5 text-xs font-mono">
            {isConnected ? (
              <span className="flex items-center text-emerald-400 gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CONNECTED</span>
              </span>
            ) : (
              <span className="flex items-center text-red-400 gap-1.5 bg-red-950/40 px-2.5 py-1 rounded-md border border-red-800/40 text-[11px]">
                <WifiOff size={13} />
                <span>OFFLINE</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
