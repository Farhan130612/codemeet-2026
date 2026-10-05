import React, { useEffect, useState } from 'react';
import { EVENT_CONFIG } from '../data/content';

export const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isDilation, setIsDilation] = useState(false);

  useEffect(() => {
    const target = new Date(EVENT_CONFIG.launchDateISO).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });

      // Occasional time dilation flicker (every ~6 seconds)
      if (seconds % 6 === 0 && Math.random() > 0.4) {
        setIsDilation(true);
        setTimeout(() => setIsDilation(false), 220);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bracket-frame p-3.5 md:p-4 rounded inline-flex flex-col gap-1.5 font-mono text-left bg-black/60 border border-[#D4FF00]/30 shadow-[0_0_20px_rgba(212,255,0,0.15)]">
      <div className="flex items-center gap-2 text-[11px] text-[#D4FF00]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-ping" />
        <span className="tracking-wider">// T-MINUS / LAUNCH WINDOW (31 OCT 2026)</span>
      </div>

      <div className="flex items-center gap-3 md:gap-5 text-xl md:text-3xl font-bold font-techno text-white">
        <div className="flex flex-col items-center">
          <span>{timeLeft.days.toString().padStart(2, '0')}</span>
          <span className="text-[9px] font-mono font-normal text-[#A1A1A1] mt-0.5">DAYS</span>
        </div>
        <span className="text-[#D4FF00] opacity-50 -mt-2">:</span>
        <div className="flex flex-col items-center">
          <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[9px] font-mono font-normal text-[#A1A1A1] mt-0.5">HRS</span>
        </div>
        <span className="text-[#D4FF00] opacity-50 -mt-2">:</span>
        <div className="flex flex-col items-center">
          <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[9px] font-mono font-normal text-[#A1A1A1] mt-0.5">MIN</span>
        </div>
        <span className="text-[#D4FF00] opacity-50 -mt-2">:</span>
        <div className="flex flex-col items-center">
          <span className={`transition-all duration-150 ${isDilation ? 'text-[#D4FF00] blur-[1.5px] scale-110' : ''}`}>
            {timeLeft.seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-[9px] font-mono font-normal text-[#A1A1A1] mt-0.5">SEC</span>
        </div>
      </div>
    </div>
  );
};
