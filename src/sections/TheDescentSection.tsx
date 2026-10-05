import React, { useRef, useState, useEffect } from 'react';
import { EVENT_CONFIG } from '../data/content';
import { ArrowUpRight, ShieldCheck, Flame } from 'lucide-react';
import { sfx } from '../components/Navbar';

export const TheDescentSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;
      
      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      setLocalProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 4 Cinematic Text Beats based on scroll
  // Beat 1: 0.00 - 0.28
  // Beat 2: 0.28 - 0.55
  // Beat 3: 0.55 - 0.80
  // Beat 4: 0.80 - 1.00
  let currentBeat = 0;
  if (localProgress < 0.28) currentBeat = 0;
  else if (localProgress < 0.55) currentBeat = 1;
  else if (localProgress < 0.80) currentBeat = 2;
  else currentBeat = 3;

  const beats = [
    {
      label: "// BEAT 01 // TIME DILATION",
      title: "24 HOURS.",
      sub: "No breaks, no pauses. A continuous descent from 1st to 2nd November at SUIET Mukka.",
      badge: "NON-STOP MARATHON"
    },
    {
      label: "// BEAT 02 // SQUAD ASSEMBLY",
      title: "4 PILOTS PER CREW.",
      sub: "2 to 4 developers per squad. Inter-college teams authorized. Bring your best architects.",
      badge: "SQUAD PROTOCOL"
    },
    {
      label: "// BEAT 03 // DEEP OBJECTIVE",
      title: "ONE MISSION BREAKTHROUGH.",
      sub: "Four classified problem statements unlocked before launch. Ship a working prototype before jury freeze.",
      badge: "4 PROBLEM STATEMENTS"
    },
    {
      label: "// BEAT 04 // FINAL INITIATION",
      title: "ENTER THE HORIZON.",
      sub: "Round 1 is 100% Free Online screening. Lock your spot before registration caps are hit.",
      badge: "FREE ONLINE SCREENING"
    }
  ];

  const ringDashOffset = 565 - 565 * localProgress;

  return (
    <section
      id="the-descent"
      ref={sectionRef}
      className="relative min-h-[280vh] bg-[#030304] z-20"
    >
      {/* Pinned Sticky Viewport (100dvh) */}
      <div className="sticky top-0 h-[100dvh] w-full flex items-center justify-between overflow-hidden px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        {/* Left Side: Dynamic Text Beats (Sitting safely on the left half, max-w-xl) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-start z-20 mt-36 sm:mt-48 lg:mt-0 select-none">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/40 text-[#D4FF00] font-mono text-xs mb-4">
            <Flame className="w-3.5 h-3.5 fill-[#D4FF00]" />
            <span>{beats[currentBeat].badge}</span>
          </div>

          <span className="text-xs font-mono text-[#D4FF00] tracking-widest uppercase mb-2">
            {beats[currentBeat].label}
          </span>

          {/* Huge Typewriter / Masked Headline */}
          <h2 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-black font-techno text-white tracking-tighter leading-[0.92] mb-4">
            <span className="text-[#D4FF00] drop-shadow-[0_0_35px_rgba(212,255,0,0.5)]">
              {beats[currentBeat].title}
            </span>
          </h2>

          <p className="text-base sm:text-xl text-[#A1A1A1] font-sans font-light leading-relaxed max-w-md mb-8">
            {beats[currentBeat].sub}
          </p>

          {/* Interactive Action on Beat 4 */}
          {currentBeat === 3 ? (
            <a
              href={EVENT_CONFIG.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sfx.playClick()}
              data-robot-target="register"
              className="px-8 py-4 bg-[#D4FF00] text-black font-techno text-sm font-bold tracking-wider rounded shadow-[0_0_30px_#D4FF00] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>CLAIM SQUAD REGISTRATION</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          ) : (
            <div className="flex items-center gap-3 text-xs font-mono text-white/50">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-ping" />
              <span>SCROLL DOWN TO ADVANCE DESCENT // {(localProgress * 100).toFixed(0)}%</span>
            </div>
          )}

        </div>

        {/* Right Side: Circular 24-Hour Singularity Ring Clock */}
        <div className="hidden lg:flex w-1/2 justify-end items-center pointer-events-none pr-8">
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* SVG Progress Ring */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="90"
                stroke="rgba(212, 255, 0, 0.15)"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="90"
                stroke="#D4FF00"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray="565"
                strokeDashoffset={ringDashOffset}
                strokeLinecap="round"
                className="transition-all duration-75 shadow-[0_0_15px_#D4FF00]"
              />
            </svg>

            {/* Center HUD readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black font-techno text-white">24H</span>
              <span className="text-[10px] font-mono text-[#D4FF00] tracking-widest">CORE SINGULARITY</span>
              <span className="text-[9px] font-mono text-[#A1A1A1] mt-1">1ST-2ND NOV</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
