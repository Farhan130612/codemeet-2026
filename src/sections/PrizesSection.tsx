import React from 'react';
import { EVENT_CONFIG } from '../data/content';
import { Trophy, Medal, Award, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { sfx } from '../components/Navbar';

export const PrizesSection: React.FC = () => {
  return (
    <section id="prizes" className="relative py-28 md:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#D4FF00]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-xs font-mono text-[#D4FF00] tracking-widest uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5 fill-[#D4FF00]" />
          <span>// REWARDS PROTOCOL 04</span>
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-techno text-white tracking-tight">
          THE PRIZE <span className="text-[#D4FF00] drop-shadow-[0_0_35px_rgba(212,255,0,0.4)]">SINGULARITY</span>
        </h2>
        <p className="text-sm font-mono text-[#A1A1A1] mt-3 max-w-xl">
          ₹50,000 TOTAL BOUNTY POOL FOR AUDACIOUS ENGINEERS AND PROBLEM SOLVERS
        </p>
      </div>

      {/* Giant Typographic Statement */}
      <div className="relative mb-20 text-center select-none">
        <div className="text-[15vw] sm:text-[13vw] md:text-[11vw] font-black font-techno leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/10 drop-shadow-[0_0_40px_rgba(212,255,0,0.25)]">
          ₹50,000
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-[#D4FF00] px-4 py-1.5 rounded-full bg-black/80 border border-[#D4FF00]/40 backdrop-blur-md">
            TOTAL CUMULATIVE PAYLOAD // CASH + TROPHIES + CREDENTIALS
          </div>
        </div>
      </div>

      {/* 3-Column Architectural Podium */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-end relative z-10 mb-16">
        
        {/* 2nd Place: Left Column (Silver) */}
        <div className="relative p-6 sm:p-8 rounded-2xl glass-panel hover:border-white/50 transition-all flex flex-col justify-between min-h-[420px] order-2 lg:order-1 group">
          <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-white/10 text-white font-bold tracking-wider">
                RANK 02
              </span>
              <Medal className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
            </div>

            <div className="text-[11px] font-mono text-[#A1A1A1] uppercase tracking-wider mb-1">
              RUNNER UP // ORBITAL SILVER
            </div>
            <div className="text-4xl sm:text-5xl font-black font-techno text-white tracking-tight my-2">
              {EVENT_CONFIG.prizePool.breakdown[1].amount}
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-[#A1A1A1] font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>Silver Commemorative Trophy &amp; Laurels</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>NAAC-Accredited Rank Certificate</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>Fast-track Incubation &amp; Mentorship Review</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>Exclusive Sponsor Goodie Vault</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10 text-[10px] font-mono text-[#A1A1A1] mt-6">
            // STATUS: TODO: replace with official split
          </div>
        </div>

        {/* 1st Place: Center Column (Neon Lime - Raised & Dominant) */}
        <div className="relative p-8 sm:p-10 rounded-2xl glass-panel-active flex flex-col justify-between min-h-[480px] order-1 lg:order-2 lg:-translate-y-6 group">
          {/* Ambient Top Glow Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4FF00] shadow-[0_0_15px_#D4FF00]" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono px-3 py-1 rounded bg-[#D4FF00] text-black font-extrabold tracking-wider shadow-[0_0_15px_rgba(212,255,0,0.6)]">
                CHAMPION SQUAD
              </span>
              <Trophy className="w-10 h-10 text-[#D4FF00] animate-pulse" />
            </div>

            <div className="text-xs font-mono text-[#D4FF00] uppercase tracking-wider mb-1">
              1ST PLACE // EVENT HORIZON APEX
            </div>
            <div className="text-5xl sm:text-6xl font-black font-techno text-[#D4FF00] tracking-tight my-2 drop-shadow-[0_0_25px_rgba(212,255,0,0.5)]">
              {EVENT_CONFIG.prizePool.breakdown[0].amount}
            </div>

            <ul className="mt-6 space-y-3 text-xs sm:text-sm text-white/90 font-sans">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span><strong>Code Meet 2026 Grand Championship Trophy</strong></span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>NAAC-Validated Gold Honor Certificates</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>Direct Investor &amp; Incubator Pitching Slot</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>VIP Developer Swag &amp; Cloud Credits Pack</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-[#D4FF00]/30 mt-6 space-y-3">
            <a
              href={EVENT_CONFIG.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sfx.playClick()}
              data-robot-target="register"
              className="w-full py-3 px-4 rounded bg-[#D4FF00] text-black font-techno text-xs font-bold tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_25px_#D4FF00] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>CLAIM SQUAD SLOT</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <div className="text-[10px] font-mono text-[#D4FF00]/80 text-center">
              // STATUS: TODO: replace with official split
            </div>
          </div>
        </div>

        {/* 3rd Place: Right Column (Bronze) */}
        <div className="relative p-6 sm:p-8 rounded-2xl glass-panel hover:border-white/50 transition-all flex flex-col justify-between min-h-[400px] order-3 group">
          <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#FFF1D0]/40 to-transparent" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#FFF1D0]/15 text-[#FFF1D0] font-bold tracking-wider">
                RANK 03
              </span>
              <Award className="w-8 h-8 text-[#FFF1D0] group-hover:scale-110 transition-transform" />
            </div>

            <div className="text-[11px] font-mono text-[#FFF1D0] uppercase tracking-wider mb-1">
              SECOND RUNNER UP // ORBITAL BRONZE
            </div>
            <div className="text-4xl sm:text-5xl font-black font-techno text-[#FFF1D0] tracking-tight my-2">
              {EVENT_CONFIG.prizePool.breakdown[2].amount}
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-[#A1A1A1] font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>Bronze Commemorative Plaque &amp; Laurels</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>NAAC-Accredited Rank Certificate</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>Developer Network Community Membership</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] shrink-0 mt-0.5" />
                <span>Partner Vouchers &amp; Goodie Bag</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/10 text-[10px] font-mono text-[#A1A1A1] mt-6">
            // STATUS: TODO: replace with official split
          </div>
        </div>

      </div>

      {/* Full-width Grant Strip for ALL participants */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col text-center md:text-left">
            <span className="text-xs font-mono text-[#D4FF00] uppercase tracking-wider">
              // UNIVERSAL MISSION PERKS
            </span>
            <h4 className="text-lg sm:text-xl font-bold font-techno text-white mt-1">
              ALL PARTICIPANTS RECEIVE MISSION CREDENTIALS
            </h4>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs font-mono text-[#A1A1A1]">
            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]" />
              NAAC Verified Certificate
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]" />
              24-Hour Meals &amp; Coffee
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]" />
              Dedicated Fiber Wi-Fi
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]" />
              Swag Kit &amp; Stickers
            </span>
          </div>
        </div>
      </div>

    </section>
  );
};
