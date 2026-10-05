import React, { useState } from 'react';
import { EVENT_CONFIG } from '../data/content';
import { ChevronDown, HelpCircle, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import { sfx } from '../components/Navbar';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    sfx.playClick();
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="relative py-28 md:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      
      {/* 2-Column Split: Sticky Directives on Left vs. Accordion on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Sticky Title, Code Integrity Badge & Mission Control Trigger */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-8">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-xs font-mono text-[#D4FF00] tracking-widest uppercase mb-4">
              <HelpCircle className="w-3.5 h-3.5 fill-[#D4FF00]" />
              <span>// OPERATIONAL DIRECTIVES 06</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-techno text-white tracking-tight leading-tight">
              RULES &amp; <span className="text-[#D4FF00] drop-shadow-[0_0_25px_rgba(212,255,0,0.4)]">PROTOCOLS</span>
            </h2>

            <p className="text-sm sm:text-base text-[#A1A1A1] font-sans font-light mt-3 leading-relaxed">
              Before entering the 24-hour event horizon, review key eligibility criteria, submission guardrails, and logistics guidelines.
            </p>
          </div>

          {/* Code Integrity Notice */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#D4FF00] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold font-techno text-white uppercase tracking-wider mb-1">
                  CODE INTEGRITY PROTOCOL
                </h4>
                <p className="text-xs sm:text-sm text-[#A1A1A1] font-sans leading-relaxed">
                  All solution code must be initiated and committed post-launch on 1st November. Utilizing public packages, boilerplate repositories, and foundational APIs is permissible with documentation.
                </p>
              </div>
            </div>
          </div>

          {/* "Ask Mission Control" Quick Connect Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#D4FF00]">
              <Sparkles className="w-4 h-4 text-[#D4FF00]" />
              <span>STILL HAVE QUESTIONS?</span>
            </div>
            <p className="text-xs text-[#A1A1A1] font-sans">
              Connect directly with student mission coordinators via call or WhatsApp message for immediate clearance.
            </p>
            <a
              href="#contact"
              onClick={() => sfx.playClick()}
              data-robot-target="mission-control"
              className="w-full py-3 px-4 rounded bg-white/5 border border-white/15 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#D4FF00] hover:text-black hover:border-[#D4FF00] transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CONTACT MISSION CONTROL</span>
            </a>
          </div>

        </div>

        {/* Right Column: High-Legibility Accordion */}
        <div className="lg:col-span-7 space-y-4">
          {EVENT_CONFIG.faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'glass-panel-active' : 'glass-panel hover:border-white/30'
                }`}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-[#D4FF00] font-bold px-2 py-0.5 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/25">
                      0{i + 1}
                    </span>
                    <span className="text-base sm:text-lg font-bold font-techno text-white">
                      {faq.q}
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#D4FF00] text-black' : 'bg-white/5 text-[#D4FF00]'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 font-sans text-sm sm:text-base text-[#A1A1A1] leading-relaxed border-t border-white/5 animate-fadeIn">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}

          <div className="text-[11px] font-mono text-white/40 pt-4 text-center sm:text-left">
            // STATUS: TODO: replace placeholders with department-specific rules if amended
          </div>
        </div>

      </div>

    </section>
  );
};
