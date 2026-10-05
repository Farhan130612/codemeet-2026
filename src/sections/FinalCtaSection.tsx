import React, { useState, useEffect } from 'react';
import { EVENT_CONFIG } from '../data/content';
import { ArrowUpRight, QrCode, Sparkles, ShieldCheck } from 'lucide-react';
import { sfx } from '../components/Navbar';

export const FinalCtaSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(EVENT_CONFIG.launchDateISO) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };
    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="final-cta" className="relative py-28 md:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      
      {/* Ambient Pulsing Event Horizon Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#D4FF00]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative rounded-3xl glass-panel-active p-8 sm:p-12 lg:p-16 shadow-[0_0_60px_rgba(204,255,0,0.25)] overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D4FF00] shadow-[0_0_20px_#D4FF00]" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline, Countdown & Action */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#D4FF00]/15 border border-[#D4FF00]/40 text-xs font-mono text-[#D4FF00] tracking-widest uppercase mb-4">
                <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-ping" />
                <span>// FINAL INITIATION // HORIZON CROSSING</span>
              </div>

              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-techno text-white tracking-tighter leading-[0.95]">
                READY TO <br />
                <span className="text-[#D4FF00] drop-shadow-[0_0_35px_rgba(212,255,0,0.6)]">CONQUER?</span>
              </h2>

              <p className="text-base sm:text-lg text-[#A1A1A1] font-sans font-light mt-4 max-w-lg leading-relaxed">
                The countdown to singularity is running. Lock in your crew, register for free online screening, and claim your presence at Code Meet 2026.
              </p>
            </div>

            {/* Countdown HUD Box */}
            <div className="p-4 sm:p-6 rounded-2xl glass-panel max-w-md">
              <div className="text-[11px] font-mono text-[#D4FF00] uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>// T-MINUS LAUNCH COUNTDOWN</span>
                <span className="text-white/40">31 OCT 2026</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 sm:p-3 rounded bg-white/5 border border-white/10">
                  <div className="text-2xl sm:text-3xl font-black font-techno text-white">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-mono text-[#A1A1A1]">DAYS</div>
                </div>
                <div className="p-2 sm:p-3 rounded bg-white/5 border border-white/10">
                  <div className="text-2xl sm:text-3xl font-black font-techno text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-mono text-[#A1A1A1]">HOURS</div>
                </div>
                <div className="p-2 sm:p-3 rounded bg-white/5 border border-white/10">
                  <div className="text-2xl sm:text-3xl font-black font-techno text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-mono text-[#A1A1A1]">MINS</div>
                </div>
                <div className="p-2 sm:p-3 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/40">
                  <div className="text-2xl sm:text-3xl font-black font-techno text-[#D4FF00] animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-mono text-[#D4FF00]">SECS</div>
                </div>
              </div>
            </div>

            {/* Action Buttons & Fast Facts */}
            <div className="space-y-4 pt-2">
              <a
                href={EVENT_CONFIG.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfx.playClick()}
                data-robot-target="register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#D4FF00] text-black font-techno text-base font-extrabold tracking-wider rounded-xl shadow-[0_0_35px_#D4FF00] hover:shadow-[0_0_55px_#D4FF00] hover:scale-105 active:scale-95 transition-all"
              >
                <span>SECURE MISSION ENTRY</span>
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </a>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A1A1A1] pt-2">
                <span className="flex items-center gap-1.5 text-white/90">
                  <ShieldCheck className="w-4 h-4 text-[#D4FF00]" />
                  Round 1: 100% Free Online Entry
                </span>
                <span>•</span>
                <span>2–4 Pilots per Squad</span>
                <span>•</span>
                <span>Venue: SUIET Mukka</span>
              </div>
            </div>

          </div>

          {/* Right Column: QR Code Bracket Station */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
            <div className="p-6 sm:p-8 rounded-3xl glass-panel flex flex-col items-center text-center shadow-[0_0_30px_rgba(204,255,0,0.15)] max-w-sm w-full">
              
              <div className="flex items-center gap-2 text-xs font-mono text-[#D4FF00] mb-4">
                <QrCode className="w-4 h-4" />
                <span>OFFICIAL REGISTRATION SCANNER</span>
              </div>

              {/* High Contrast QR Code Image */}
              <div className="p-4 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.4)] my-2">
                <img
                  src={EVENT_CONFIG.qrImage}
                  alt="Code Meet 2026 QR Code"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                />
              </div>

              <div className="text-xs font-mono text-white mt-4 font-bold">
                AIM PHONE CAMERA OR GOOGLE LENS
              </div>
              <div className="text-[11px] font-mono text-[#A1A1A1] mt-1">
                INSTANT FORM DISPATCH ON MOBILE
              </div>

            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
