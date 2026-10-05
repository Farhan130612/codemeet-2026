import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  "> INITIALIZING CODE_MEET_2026...",
  "> HOST: SUIET_MUKKA // WEBFLOW_COMMUNITY",
  "> CALIBRATING GRAVITATIONAL LENSING...",
  "> LOADING IDEAS: ['CODE', 'CREATE', 'CONQUER']...",
  "> EVENT_HORIZON_COORDINATES_LOCKED.",
  "> LAUNCH_READY // SYSTEM ACTIVE."
];

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 2.2 second smooth counter
    const startTime = Date.now();
    const duration = 2200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(pct);

      const targetLog = Math.floor((pct / 100) * (BOOT_LOGS.length - 1));
      setLogIndex(targetLog);

      if (pct >= 100) {
        clearInterval(interval);
        finish();
      }
    }, 35);

    // Skip on Escape key
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        clearInterval(interval);
        finish();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const finish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 550);
  };

  return (
    <div
      onClick={finish}
      className={`fixed inset-0 z-[99999] bg-[#030304] flex flex-col justify-between p-6 md:p-12 font-mono transition-all duration-500 cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Telemetry */}
      <div className="flex justify-between items-center text-xs md:text-sm text-[#A1A1A1] border-b border-[#D4FF00]/20 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF00] animate-pulse shadow-[0_0_8px_#D4FF00]" />
          <span className="text-[#D4FF00] font-bold">MISSION: BEYOND THE EVENT HORIZON</span>
        </div>
        <div className="text-[11px] opacity-75">
          [PRESS ESC OR CLICK TO SKIP]
        </div>
      </div>

      {/* Terminal Boot Log */}
      <div className="max-w-2xl my-auto space-y-3">
        <div className="text-xs text-[#D4FF00]/60">// TERMINAL BOOT SEQUENCE</div>
        <div className="space-y-2 text-sm md:text-base">
          {BOOT_LOGS.slice(0, logIndex + 1).map((log, i) => (
            <div key={i} className="text-[#D4FF00] flex items-center gap-2">
              <span className="text-[#FFF1D0]">{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Percentage Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-xs text-[#A1A1A1]">SUBSYSTEMS SYNCHRONIZED</span>
          <span className="text-3xl md:text-5xl font-bold font-techno text-[#D4FF00] tracking-wider">
            {progress.toString().padStart(3, '0')}%
          </span>
        </div>
        <div className="w-full h-1 bg-[#1A1A1A] overflow-hidden">
          <div
            className="h-full bg-[#D4FF00] transition-all duration-75 shadow-[0_0_12px_#D4FF00]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
