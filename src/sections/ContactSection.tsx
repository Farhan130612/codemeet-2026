import React, { useState } from 'react';
import { EVENT_CONFIG } from '../data/content';
import { Phone, MessageSquare, MapPin, ExternalLink, Radio, Copy, Check } from 'lucide-react';
import { sfx } from '../components/Navbar';

export const ContactSection: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (phone: string, index: number) => {
    sfx.playClick();
    navigator.clipboard.writeText(phone);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="contact" className="relative py-28 md:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      
      {/* Section Header */}
      <div className="flex flex-col items-start mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-xs font-mono text-[#D4FF00] tracking-widest uppercase mb-4">
          <Radio className="w-3.5 h-3.5 fill-[#D4FF00]" />
          <span>// COMMUNICATIONS DISPATCH 07</span>
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-techno text-white tracking-tight">
          MISSION <span className="text-[#D4FF00] drop-shadow-[0_0_35px_rgba(212,255,0,0.4)]">CONTROL</span>
        </h2>
        <p className="text-base sm:text-lg text-[#A1A1A1] font-sans font-light mt-3 max-w-2xl leading-relaxed">
          Direct communication links to student mission leads and physical navigation coordinates to the SUIET Mukka campus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Coordinators Grid (Left 7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {EVENT_CONFIG.coordinators.map((coord, i) => (
            <div
              key={i}
              className="p-6 sm:p-8 rounded-2xl glass-panel hover:border-[#D4FF00]/60 transition-all flex flex-col justify-between group hover:shadow-[0_0_30px_rgba(204,255,0,0.15)]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-[#D4FF00] font-bold tracking-wider">
                    // LEAD FLIGHT OFFICER 0{i + 1}
                  </span>
                  <button
                    onClick={() => handleCopy(coord.phone, i)}
                    title="Copy phone number"
                    className="p-1.5 rounded bg-white/5 border border-white/10 hover:border-[#D4FF00] hover:text-[#D4FF00] text-[#A1A1A1] transition-all flex items-center gap-1 text-[11px] font-mono"
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#D4FF00]" />
                        <span className="text-[#D4FF00]">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold font-techno text-white group-hover:text-[#D4FF00] transition-colors">
                  {coord.name}
                </h3>
                <div className="text-sm text-[#A1A1A1] font-mono mt-1 mb-6">
                  {coord.role}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/10">
                <a
                  href={coord.telLink}
                  onClick={() => sfx.playClick()}
                  className="w-full py-3 px-4 rounded-lg bg-black border border-[#D4FF00]/40 text-[#D4FF00] font-mono text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#D4FF00] hover:text-black transition-all shadow-[0_0_15px_rgba(212,255,0,0.15)]"
                >
                  <Phone className="w-4 h-4" />
                  <span>{coord.phone}</span>
                </a>

                <a
                  href={coord.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sfx.playClick()}
                  className="w-full py-3 px-4 rounded-lg bg-[#25D366]/10 border border-[#25D366]/40 text-[#25D366] font-mono text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#25D366] hover:text-black transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WHATSAPP CLEARANCE</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Venue & Navigation Card (Right 5 Cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl glass-panel hover:border-[#D4FF00]/60 transition-all flex flex-col justify-between group hover:shadow-[0_0_30px_rgba(204,255,0,0.15)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#D4FF00] mb-3">
              <MapPin className="w-4 h-4 text-[#D4FF00]" />
              <span>// SURFACE LOCATION COORDINATES</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold font-techno text-white group-hover:text-[#D4FF00] transition-colors mb-2">
              {EVENT_CONFIG.host.institution}
            </h3>

            <p className="text-sm sm:text-base text-[#A1A1A1] font-sans leading-relaxed mb-6">
              {EVENT_CONFIG.host.fullName}
              <br />
              {EVENT_CONFIG.host.location}
            </p>

            <div className="text-xs font-mono text-white/90 p-4 rounded-lg bg-black/60 border border-white/10 space-y-1.5">
              <div className="text-[#D4FF00] font-bold">RADAR TELEMETRY:</div>
              <div>COORDINATES: 13.0118° N, 74.8024° E</div>
              <div>HIGHWAY ACCESS: National Highway 66 (Mukka Beach Corridor)</div>
              <div>RAIL/AIR HUB: Mangaluru Central &amp; Mangaluru Int'l Airport</div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6">
            <a
              href={EVENT_CONFIG.host.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sfx.playClick()}
              className="w-full py-3.5 px-4 rounded-lg bg-[#D4FF00]/15 border border-[#D4FF00]/40 text-[#D4FF00] font-techno text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#D4FF00] hover:text-black transition-all shadow-[0_0_20px_rgba(212,255,0,0.2)]"
            >
              <span>LAUNCH GOOGLE MAPS GUIDANCE</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

    </section>
  );
};
