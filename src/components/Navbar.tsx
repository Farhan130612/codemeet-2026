import React, { useState } from 'react';
import { EVENT_CONFIG } from '../data/content';
import { Menu, X, ArrowUpRight, Volume2, VolumeX } from 'lucide-react';

interface NavbarProps {
  scrollProgress: number;
}

// Lightweight WebAudio synthesizer for soft cyber UI clicks & robot whirr
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  public playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playWhirr() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
}

export const sfx = new SoundFX();

export const Navbar: React.FC<NavbarProps> = ({ scrollProgress }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [audioActive, setAudioActive] = useState(false);

  const horizonPct = Math.min(Math.max(Math.round(scrollProgress * 100), 0), 100);

  const toggleAudio = () => {
    const next = !audioActive;
    setAudioActive(next);
    sfx.enabled = next;
    if (next) sfx.playWhirr();
  };

  const navLinks = [
    { name: "Brief", href: "#about" },
    { name: "Missions", href: "#missions" },
    { name: "The Descent", href: "#the-descent" },
    { name: "Tracks", href: "#tracks" },
    { name: "Prizes", href: "#prizes" },
    { name: "Flight Plan", href: "#schedule" },
    { name: "Protocol", href: "#faq" },
    { name: "Mission Control", href: "#contact" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#030304]/85 backdrop-blur-md border-b border-[#D4FF00]/15 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Left: Brand Logo & Title */}
        <a
          href="#"
          onClick={() => sfx.playClick()}
          className="flex items-center gap-2.5 group"
        >
          <img
            src="/assets/cm-logo.png"
            alt="Code Meet Logo"
            className="w-7 h-7 object-contain group-hover:scale-105 transition-transform"
          />
          <div className="flex items-center gap-1.5 font-techno font-bold text-sm tracking-wider text-white">
            <span>CODE</span>
            <span className="text-[#D4FF00]">MEET</span>
            <span className="text-[11px] text-[#A1A1A1] font-mono">2026</span>
          </div>
        </a>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[12px] font-mono tracking-wider text-[#A1A1A1]">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => sfx.playClick()}
              className="hover:text-[#D4FF00] transition-colors py-1 relative group"
            >
              <span>{link.name}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#D4FF00] group-hover:w-full transition-all duration-200" />
            </a>
          ))}
        </nav>

        {/* Right: Integrated Telemetry, Audio Toggle & Register CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Integrated Slim Horizon Telemetry Label (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[#D4FF00] bg-black/60 px-2.5 py-1 rounded border border-[#D4FF00]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-pulse" />
            <span className="text-white/60">HORIZON</span>
            <span className="font-bold">{horizonPct}%</span>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleAudio}
            title={audioActive ? "Mute audio" : "Enable ambient UI audio"}
            className="p-1.5 rounded bg-black/60 border border-[#D4FF00]/25 text-[#A1A1A1] hover:text-[#D4FF00] hover:border-[#D4FF00] transition-colors"
          >
            {audioActive ? <Volume2 className="w-3.5 h-3.5 text-[#D4FF00]" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Sticky Desktop Register Button */}
          <a
            href={EVENT_CONFIG.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sfx.playClick()}
            data-robot-target="register"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#D4FF00] text-black font-techno text-[11px] font-bold tracking-wider rounded hover:shadow-[0_0_20px_#D4FF00] hover:scale-105 active:scale-95 transition-all"
          >
            <span>REGISTER NOW</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Register Quick Button */}
          <a
            href={EVENT_CONFIG.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sfx.playClick()}
            className="sm:hidden px-3 py-1.5 bg-[#D4FF00] text-black font-techno text-[10px] font-bold tracking-wider rounded shadow-[0_0_10px_#D4FF00]"
          >
            REGISTER
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => {
              sfx.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden text-white p-1.5 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#D4FF00]" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>

      </div>

      {/* Slim Integrated Horizon Scroll Progress Rail along the bottom edge of nav */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/40 overflow-hidden">
        <div
          className="h-full bg-[#D4FF00] shadow-[0_0_8px_#D4FF00] transition-all duration-75"
          style={{ width: `${horizonPct}%` }}
        />
      </div>

      {/* Mobile Staggered Fullscreen Overlay Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[#030304]/98 backdrop-blur-2xl z-50 flex flex-col justify-between p-6 font-techno border-t border-[#D4FF00]/20 animate-fadeIn">
          <div className="flex flex-col gap-4 pt-4">
            {navLinks.map((link, idx) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => {
                  sfx.playClick();
                  setMobileMenuOpen(false);
                }}
                className="text-xl font-bold tracking-wider text-[#A1A1A1] hover:text-[#D4FF00] transition-colors flex items-center justify-between border-b border-white/5 pb-2.5"
              >
                <span>{link.name}</span>
                <span className="text-xs font-mono text-[#D4FF00]">0{idx + 1} ↗</span>
              </a>
            ))}
          </div>

          <div className="pt-4 pb-6">
            <a
              href={EVENT_CONFIG.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                sfx.playClick();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3.5 bg-[#D4FF00] text-black text-center font-bold tracking-widest rounded flex items-center justify-center gap-2 shadow-[0_0_20px_#D4FF00]"
            >
              <span>REGISTER FOR HACKATHON</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
