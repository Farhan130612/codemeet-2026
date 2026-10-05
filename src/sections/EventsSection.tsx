import React, { useState } from 'react';
import { EVENT_CONFIG } from '../data/content';
import { Keyboard, Crosshair, Map, ArrowUpRight, Check, Key } from 'lucide-react';
import { sfx } from '../components/Navbar';

export const EventsSection: React.FC = () => {
  // Interactive Widget 1: Speed Typing live mini test
  const [typedInput, setTypedInput] = useState('');
  const targetText = "const future = conquer();";
  const isTypingCorrect = targetText.startsWith(typedInput);
  const isTypingFinished = typedInput === targetText;

  // Interactive Widget 2: Free Fire Squad selector
  const [squadSize, setSquadSize] = useState(4);

  // Interactive Widget 3: Treasure Hunt reveal clue
  const [clueDecrypted, setClueDecrypted] = useState(false);

  return (
    <section id="missions" className="relative py-28 md:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#D4FF00] tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-[#D4FF00]" />
            <span>// STAGE 01 // 31ST OCTOBER 2026</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-techno text-white tracking-tight">
            DAY 01 <span className="text-[#D4FF00]">MISSIONS</span>
          </h2>
        </div>
        <div className="text-xs font-mono text-[#A1A1A1] max-w-xs">
          ORBITAL QUALIFIERS PRIOR TO THE 24-HOUR SINGULARITY DESCENT.
        </div>
      </div>

      {/* Horizontal Scroll Gallery (Snap-scroll on mobile, 3-column asymmetric layout on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CARD 01: SPEED TYPING */}
        <div
          data-cursor="card"
          className="p-8 rounded-2xl glass-panel hover:border-[#D4FF00]/60 flex flex-col justify-between transition-all group"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-4xl font-black font-techno text-[#D4FF00]/40 group-hover:text-[#D4FF00] transition-colors">
                01
              </span>
              <div className="p-3 rounded-lg bg-black border border-[#D4FF00]/30 text-[#D4FF00]">
                <Keyboard className="w-6 h-6" />
              </div>
            </div>

            <span className="text-[11px] font-mono text-[#D4FF00] uppercase">// MISSION: SYNTAX SPRINT</span>
            <h3 className="text-2xl font-black font-techno text-white mb-2">Speed Typing</h3>
            <p className="text-sm text-[#A1A1A1] leading-relaxed mb-6 font-sans">
              Push keypress latency to absolute zero. Race against Karnataka's fastest student coders under live pressure.
            </p>

            {/* Interactive Widget: Live Mini Typing Strip */}
            <div className="p-4 rounded-xl bg-black border border-white/10 mb-6 space-y-2">
              <div className="text-[10px] font-mono text-white/50 flex justify-between">
                <span>BENCHMARK SPEED TEST</span>
                <span className={isTypingFinished ? "text-[#D4FF00] font-bold" : ""}>
                  {isTypingFinished ? "VERIFIED (120 WPM)" : "TYPE BELOW"}
                </span>
              </div>
              <div className="font-mono text-xs text-[#FFF1D0] tracking-wide select-none">
                {targetText}
              </div>
              <input
                type="text"
                value={typedInput}
                onChange={(e) => {
                  setTypedInput(e.target.value);
                  sfx.playClick();
                }}
                placeholder="type syntax here..."
                className={`w-full bg-[#121318] text-xs font-mono px-3 py-2 rounded outline-none border transition-colors ${
                  isTypingFinished
                    ? 'border-[#D4FF00] text-[#D4FF00]'
                    : isTypingCorrect
                    ? 'border-white/20 text-white'
                    : 'border-red-500/60 text-red-400'
                }`}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-[#A1A1A1]">31 OCT 2026</span>
            <a
              href={EVENT_CONFIG.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sfx.playClick()}
              className="text-[#D4FF00] font-bold flex items-center gap-1 hover:underline"
            >
              <span>REGISTER</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* CARD 02: FREE FIRE */}
        <div
          data-cursor="card"
          className="p-8 rounded-2xl glass-panel hover:border-[#D4FF00]/60 flex flex-col justify-between transition-all group"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-4xl font-black font-techno text-[#D4FF00]/40 group-hover:text-[#D4FF00] transition-colors">
                02
              </span>
              <div className="p-3 rounded-lg bg-black border border-[#D4FF00]/30 text-[#D4FF00]">
                <Crosshair className="w-6 h-6" />
              </div>
            </div>

            <span className="text-[11px] font-mono text-[#D4FF00] uppercase">// MISSION: SQUAD BATTLE</span>
            <h3 className="text-2xl font-black font-techno text-white mb-2">Free Fire</h3>
            <p className="text-sm text-[#A1A1A1] leading-relaxed mb-6 font-sans">
              Tactical e-sports showdown. Deploy battle communication, spatial coordination, and knockout supremacy.
            </p>

            {/* Interactive Widget: Squad Count Selector */}
            <div className="p-4 rounded-xl bg-black border border-white/10 mb-6 space-y-3">
              <div className="text-[10px] font-mono text-white/50 flex justify-between">
                <span>SELECT SQUAD STRENGTH</span>
                <span className="text-[#D4FF00] font-bold">{squadSize} PILOTS</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setSquadSize(num);
                      sfx.playClick();
                    }}
                    className={`py-2 text-xs font-mono font-bold rounded transition-all ${
                      squadSize === num
                        ? 'bg-[#D4FF00] text-black shadow-[0_0_12px_#D4FF00]'
                        : 'bg-[#121318] text-[#A1A1A1] hover:text-white'
                    }`}
                  >
                    {num}P
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-mono text-[#A1A1A1]">
                {squadSize === 4 ? "Full combat roster configured." : "Squad slots available."}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-[#A1A1A1]">31 OCT 2026</span>
            <a
              href={EVENT_CONFIG.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sfx.playClick()}
              className="text-[#D4FF00] font-bold flex items-center gap-1 hover:underline"
            >
              <span>REGISTER</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* CARD 03: TREASURE HUNT */}
        <div
          data-cursor="card"
          className="p-8 rounded-2xl glass-panel hover:border-[#D4FF00]/60 flex flex-col justify-between transition-all group"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-4xl font-black font-techno text-[#D4FF00]/40 group-hover:text-[#D4FF00] transition-colors">
                03
              </span>
              <div className="p-3 rounded-lg bg-black border border-[#D4FF00]/30 text-[#D4FF00]">
                <Map className="w-6 h-6" />
              </div>
            </div>

            <span className="text-[11px] font-mono text-[#D4FF00] uppercase">// MISSION: CIPHER DECRYPT</span>
            <h3 className="text-2xl font-black font-techno text-white mb-2">Treasure Hunt</h3>
            <p className="text-sm text-[#A1A1A1] leading-relaxed mb-6 font-sans">
              Decouple cryptic digital ciphers and physical coordinates hidden across the SUIET Mukka campus perimeter.
            </p>

            {/* Interactive Widget: Reveal Clue Decryption */}
            <div className="p-4 rounded-xl bg-black border border-white/10 mb-6 space-y-2">
              <div className="text-[10px] font-mono text-white/50 flex justify-between">
                <span>INITIAL CLUE VECTOR</span>
                <span className="text-[#D4FF00]">{clueDecrypted ? "DECRYPTED" : "LOCKED"}</span>
              </div>
              <div className="p-2.5 rounded bg-[#121318] font-mono text-xs text-[#D4FF00] flex items-center justify-between">
                <span>
                  {clueDecrypted ? "SECTOR: 13.0118°N // BLDG 04 FOYER" : "0x43 0x4D 0x32 0x36 [ENCRYPTED]"}
                </span>
                {clueDecrypted ? <Check className="w-4 h-4 text-[#D4FF00]" /> : <Key className="w-4 h-4 text-white/40" />}
              </div>
              <button
                onClick={() => {
                  setClueDecrypted(!clueDecrypted);
                  sfx.playWhirr();
                }}
                className="w-full py-1.5 text-[10px] font-mono rounded bg-white/5 hover:bg-[#D4FF00]/15 text-[#A1A1A1] hover:text-[#D4FF00] transition-colors"
              >
                {clueDecrypted ? "Re-encrypt Vector" : "Click to Decrypt Sample Clue"}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-[#A1A1A1]">31 OCT 2026</span>
            <a
              href={EVENT_CONFIG.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sfx.playClick()}
              className="text-[#D4FF00] font-bold flex items-center gap-1 hover:underline"
            >
              <span>REGISTER</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

    </section>
  );
};
