import React from 'react';
import { ArrowUp, Terminal } from 'lucide-react';
import { sfx } from './Navbar';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    sfx.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#030304] border-t border-[#D4FF00]/20 z-20 py-16 px-4 sm:px-6 lg:px-8 text-xs font-mono text-[#A1A1A1]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Brand & Mission Statement */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <div className="font-techno font-black text-white text-xl flex items-center gap-2">
            <span>CODE</span>
            <span className="text-[#D4FF00] drop-shadow-[0_0_10px_#D4FF00]">MEET</span>
            <span className="text-sm text-white/60">2026</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-[#D4FF00] border border-[#D4FF00]/30 ml-2">
              &lt;/&gt; #24hrs_Hackathon
            </span>
          </div>

          <div className="text-xs text-[#D4FF00] font-mono flex items-center gap-1.5 mt-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>const ideas = [code, "create", "conquer"]; return future();</span>
          </div>

          <div className="text-[11px] text-white/50 mt-1">
            &copy; 2026 Code Meet. SUIET Mukka (Srinivas University) in alliance with Webflow Community.
          </div>
        </div>

        {/* Navigation Section Anchors */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
          <a href="#about" onClick={() => sfx.playClick()} className="hover:text-[#D4FF00] transition-colors">Mission Brief</a>
          <a href="#missions" onClick={() => sfx.playClick()} className="hover:text-[#D4FF00] transition-colors">Day 1 Missions</a>
          <a href="#the-descent" onClick={() => sfx.playClick()} className="hover:text-[#D4FF00] transition-colors">The Descent</a>
          <a href="#tracks" onClick={() => sfx.playClick()} className="hover:text-[#D4FF00] transition-colors">Tracks</a>
          <a href="#prizes" onClick={() => sfx.playClick()} className="hover:text-[#D4FF00] transition-colors">Prizes</a>
          <a href="#schedule" onClick={() => sfx.playClick()} className="hover:text-[#D4FF00] transition-colors">Flight Plan</a>
          <a href="#faq" onClick={() => sfx.playClick()} className="hover:text-[#D4FF00] transition-colors">Rules &amp; FAQ</a>
          <a href="#contact" onClick={() => sfx.playClick()} className="hover:text-[#D4FF00] transition-colors">Mission Control</a>
        </div>

        {/* Back to top button */}
        <button
          onClick={scrollToTop}
          className="p-3.5 px-5 rounded-lg bg-black border border-[#D4FF00]/40 text-[#D4FF00] hover:bg-[#D4FF00] hover:text-black transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,255,0,0.15)] group"
          aria-label="Back to Top"
        >
          <span className="font-bold tracking-wider">APEX ORBIT</span>
          <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
        </button>

      </div>
    </footer>
  );
};
