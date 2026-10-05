import React, { useState, useEffect } from 'react';
import { EVENT_CONFIG } from '../data/content';
import { Terminal } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const [typedCode, setTypedCode] = useState('');
  const fullCode = EVENT_CONFIG.posterCodeSnippet;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedCode(fullCode.slice(0, index));
      index++;
      if (index > fullCode.length) {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [fullCode]);

  const statementWords = [
    "We", "don't", "hand", "out", "mere", "certificates.",
    "We", "engineer", "orbital", "launch", "pads.",
    "24", "hours", "to", "build", "what", "survives", "the", "singularity."
  ];

  return (
    <section id="about" className="relative py-28 md:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      
      {/* Section Header */}
      <div className="flex flex-col items-start mb-16">
        <div className="flex items-center gap-2 text-xs font-mono text-[#D4FF00] tracking-widest uppercase mb-3">
          <span className="w-2 h-2 rounded-full bg-[#D4FF00]" />
          <span>// MISSION BRIEFING 01</span>
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-techno text-white tracking-tight">
          THE LAUNCH <span className="text-[#D4FF00]">MANDATE</span>
        </h2>
      </div>

      {/* Split Layout: Huge Statement vs. Terminal Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
        
        {/* Left: Huge Statement Typography */}
        <div className="lg:col-span-7 space-y-6">
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-sans leading-tight tracking-tight text-white">
            {statementWords.map((word, i) => (
              <span
                key={i}
                className={`inline-block mr-2.5 transition-colors ${
                  ["launch", "pads.", "singularity."].includes(word)
                    ? "text-[#D4FF00] underline decoration-[#D4FF00]/40"
                    : ["survives"].includes(word)
                    ? "text-[#FFF1D0]"
                    : "text-white/90"
                }`}
              >
                {word}
              </span>
            ))}
          </p>

          <p className="text-base sm:text-lg text-[#A1A1A1] leading-relaxed font-sans font-light max-w-xl pt-2">
            Organized by <strong className="text-white">SUIET, Mukka</strong> in alliance with <strong className="text-white">Webflow Community</strong>. A high-stakes trial of algorithmic combat, hardware-software fusion, and rapid execution.
          </p>
        </div>

        {/* Right: Modern Cyber Terminal typing code */}
        <div className="lg:col-span-5">
          <div className="rounded-xl overflow-hidden shadow-[0_0_35px_rgba(204,255,0,0.15)] glass-panel">
            <div className="bg-[#121318]/90 px-4 py-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                <span className="text-[11px] font-mono text-[#A1A1A1] ml-2 flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-[#D4FF00]" />
                  mission_core.ts
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#D4FF00]/80">NODE v24</span>
            </div>

            <div className="p-6 font-mono text-xs sm:text-sm text-[#D4FF00] min-h-[170px] leading-relaxed">
              <pre className="whitespace-pre-wrap">
                <code>
                  {typedCode}
                  <span className="inline-block w-2 h-4 bg-[#D4FF00] ml-1 animate-pulse" />
                </code>
              </pre>
              <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-[#A1A1A1] flex items-center justify-between">
                <span>// COMPILER: CLEAN</span>
                <span className="text-[#FFF1D0]">TARGET: 31 OCT 2026</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Big Borderless Counter Row (Enclosed in Glassmorphism Container) */}
      <div className="glass-panel p-6 sm:p-10 rounded-2xl grid grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* 24 Hours */}
        <div className="flex flex-col items-start pr-6 lg:border-r border-white/10">
          <span className="text-[11px] font-mono text-[#D4FF00] uppercase mb-1">// DURATION</span>
          <div className="text-5xl sm:text-6xl md:text-7xl font-black font-techno text-white tracking-tighter">
            24<span className="text-[#D4FF00] text-3xl sm:text-4xl">H</span>
          </div>
          <span className="text-xs text-[#A1A1A1] font-mono mt-1">Continuous Sprint</span>
        </div>

        {/* Rs 50,000 */}
        <div className="flex flex-col items-start px-0 lg:px-6 lg:border-r border-white/10">
          <span className="text-[11px] font-mono text-[#D4FF00] uppercase mb-1">// TOTAL POOL</span>
          <div className="text-5xl sm:text-6xl md:text-7xl font-black font-techno text-white tracking-tighter">
            ₹50<span className="text-[#D4FF00] text-3xl sm:text-4xl">K</span>
          </div>
          <span className="text-xs text-[#A1A1A1] font-mono mt-1">Cash Rewards &amp; Perks</span>
        </div>

        {/* 3 Day-1 Events */}
        <div className="flex flex-col items-start pr-6 lg:px-6 lg:border-r border-white/10">
          <span className="text-[11px] font-mono text-[#D4FF00] uppercase mb-1">// ORBITAL MISSIONS</span>
          <div className="text-5xl sm:text-6xl md:text-7xl font-black font-techno text-white tracking-tighter">
            03<span className="text-[#D4FF00] text-3xl sm:text-4xl">*</span>
          </div>
          <span className="text-xs text-[#A1A1A1] font-mono mt-1">Day 1 Competitive Tracks</span>
        </div>

        {/* 2 Days */}
        <div className="flex flex-col items-start lg:pl-6">
          <span className="text-[11px] font-mono text-[#D4FF00] uppercase mb-1">// SINGULARITY</span>
          <div className="text-5xl sm:text-6xl md:text-7xl font-black font-techno text-white tracking-tighter">
            02<span className="text-[#D4FF00] text-3xl sm:text-4xl">D</span>
          </div>
          <span className="text-xs text-[#A1A1A1] font-mono mt-1">Onsite Final Descent</span>
        </div>

      </div>

    </section>
  );
};
