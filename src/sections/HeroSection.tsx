import React from 'react';
import { EVENT_CONFIG } from '../data/content';
import { CountdownTimer } from '../components/CountdownTimer';
import { ArrowUpRight, ChevronDown, Zap, Calendar, MapPin, Award } from 'lucide-react';
import { sfx } from '../components/Navbar';

interface HeroSectionProps {
  isEntering?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isEntering = true }) => {
  return (
    <section id="hero" className="relative min-h-[100dvh] pt-24 sm:pt-28 lg:pt-32 pb-12 flex flex-col justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20 pointer-events-none">
      
      {/* Cinematic Visor Bloom Flare (Continuous with end of loading video) */}
      <div
        style={{
          opacity: isEntering ? 0 : 0.7,
          transform: isEntering ? 'scale(2.2)' : 'scale(0.6)',
          transition: 'opacity 1.6s ease-out, transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(204,255,0,0.3)_0%,rgba(0,240,255,0.15)_45%,transparent_75%)] blur-[90px] pointer-events-none"
      />

      {/* Quiet Background Code Snippet Typography */}
      <div className="absolute top-28 left-6 pointer-events-none opacity-10 font-mono text-xs sm:text-sm text-[#D4FF00] select-none hidden lg:block leading-relaxed max-w-sm">
        <p>// MISSION ORBITAL TELEMETRY</p>
        <p>const ideas = [code, "create", "conquer"];</p>
        <p>ideas.forEach(v =&gt; build(v));</p>
        <p>return future();</p>
      </div>

      {/* Main Hero Grid: Left Column max 50% on desktop (leaving right 45% clear for the robot) */}
      <div className="my-auto py-4 lg:py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Content Column with synchronized zoom-in from video helmet center */}
        <div
          style={{
            transform: isEntering ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(32px)',
            filter: isEntering ? 'blur(0px)' : 'blur(12px)',
            opacity: isEntering ? 1 : 0,
            transition: 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), filter 1.3s ease-out, opacity 1.1s ease-out'
          }}
          className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left pointer-events-auto mt-44 sm:mt-52 lg:mt-0"
        >
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/40 text-[#D4FF00] font-mono text-xs mb-4 shadow-[0_0_15px_rgba(212,255,0,0.15)]">
            <Zap className="w-3.5 h-3.5 fill-[#D4FF00]" />
            <span className="font-bold">{EVENT_CONFIG.hashtagBadge}</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">SUIET MUKKA</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black font-techno tracking-tighter leading-[0.92] mb-5">
            <span className="text-white block">CODE</span>
            <span className="text-[#D4FF00] drop-shadow-[0_0_30px_rgba(212,255,0,0.65)] block">MEET</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#A1A1A1] border-text block text-4xl sm:text-5xl md:text-6xl mt-1 tracking-widest">
              2026
            </span>
          </h1>

          {/* Storyline Narrative */}
          <p className="text-base sm:text-lg md:text-xl text-[#A1A1A1] max-w-lg font-sans font-light leading-relaxed mb-6">
            <span className="text-[#FFF1D0] font-normal">BEYOND THE EVENT HORIZON.</span> 24 hours of algorithmic creation where time dilates and only ideas survive.
          </p>

          {/* Quick Date & Venue Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#D4FF00] mb-6">
            <div className="flex items-center gap-1.5 glass-panel px-3.5 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5" />
              <span>31 OCT - 02 NOV 2026</span>
            </div>
            <div className="flex items-center gap-1.5 glass-panel px-3.5 py-1.5 rounded-lg">
              <MapPin className="w-3.5 h-3.5" />
              <span>SUIET CAMPUS, MUKKA</span>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <a
              href={EVENT_CONFIG.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sfx.playClick()}
              data-robot-target="register"
              className="px-8 py-3.5 bg-[#D4FF00] text-black font-techno text-xs sm:text-sm font-bold tracking-wider rounded shadow-[0_0_25px_rgba(212,255,0,0.6)] hover:shadow-[0_0_45px_#D4FF00] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
            >
              <span>REGISTER NOW</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href="#missions"
              onClick={() => sfx.playClick()}
              data-robot-target="missions"
              className="px-6 py-3.5 border border-[#D4FF00]/40 text-white font-mono text-xs sm:text-sm tracking-wider rounded hover:bg-[#D4FF00]/10 hover:border-[#D4FF00] transition-all flex items-center gap-2"
            >
              <span>VIEW MISSIONS</span>
              <span className="text-[#D4FF00]">↓</span>
            </a>
          </div>

          {/* Compact Prize Payload Chip Row (Glassmorphism, crisp readability) */}
          <div className="glass-panel px-4 py-2.5 rounded-xl mb-6 flex items-center gap-3 text-xs font-mono">
            <Award className="w-4 h-4 text-[#D4FF00]" />
            <span className="text-white font-bold">{EVENT_CONFIG.prizePool.total} PRIZE POOL</span>
            <span className="text-white/40">|</span>
            <span className="text-[#D4FF00]">ROUND 1: FREE ONLINE</span>
          </div>

          {/* Countdown Timer (Bottom-Left) */}
          <div data-robot-target="countdown" className="w-full sm:w-auto glass-panel p-3.5 sm:p-4 rounded-xl">
            <CountdownTimer />
          </div>

        </div>

        {/* Right Column: Kept 100% CLEAR on desktop for the 3D Robot Companion */}
        <div className="lg:col-span-6 xl:col-span-6 hidden lg:block pointer-events-none" />

      </div>

      {/* Bottom Scroll Indicator */}
      <div className="flex justify-between items-center text-xs font-mono text-[#A1A1A1]/60 pt-2 pointer-events-auto">
        <span className="hidden sm:inline">// SCROLL TO INITIATE DESCENT</span>
        <a
          href="#about"
          onClick={() => sfx.playClick()}
          className="flex items-center gap-1.5 hover:text-[#D4FF00] transition-colors ml-auto"
        >
          <span>MISSION BRIEFING</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#D4FF00]" />
        </a>
      </div>

    </section>
  );
};
