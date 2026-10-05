import React from 'react';
import { Radio, ShieldCheck, Globe, Cpu, Award } from 'lucide-react';

export const PartnersSection: React.FC = () => {
  const partners = [
    {
      name: "SUIET, Mukka",
      title: "Host Institution",
      detail: "Srinivas University Institute of Engineering & Technology",
      logo: "/assets/srinivas-iic.png",
      tag: "ORGANIZER"
    },
    {
      name: "Webflow Community",
      title: "Design & Web Partner",
      detail: "Official Collaborative Community Ecosystem",
      logo: "/assets/webflow.jpg",
      tag: "COMMUNITY ALLIANCE"
    },
    {
      name: "NAAC Grade 'A'",
      title: "Academic Accreditation",
      detail: "National Assessment & Accreditation Council",
      logo: "/assets/naac-badge.png",
      tag: "ACCREDITED"
    },
    {
      name: "IBM",
      title: "Powering Partner",
      detail: "Featured on Code Meet Official Poster",
      isText: true,
      tag: "POWERED BY"
    }
  ];

  return (
    <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-xs font-mono text-[#D4FF00] tracking-widest uppercase mb-4">
          <Radio className="w-3.5 h-3.5 fill-[#D4FF00]" />
          <span>// ALLIED ORBITS &amp; ECOSYSTEM</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-techno text-white tracking-tight">
          COLLABORATIVE <span className="text-[#D4FF00] drop-shadow-[0_0_25px_rgba(212,255,0,0.4)]">NETWORK</span>
        </h2>
        <p className="text-xs sm:text-sm font-mono text-[#A1A1A1] mt-3 max-w-lg">
          OFFICIAL INSTITUTIONAL, COMMUNITY, AND ACCREDITATION ALLIANCES
        </p>
      </div>

      {/* Modern Partner Cards with Grayscale to Color & Ambient Hover Glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {partners.map((partner, i) => (
          <div
            key={i}
            className="group relative p-8 rounded-xl bg-[#090A0E]/80 border border-white/10 hover:border-[#D4FF00]/50 transition-all duration-300 flex flex-col justify-between items-center text-center backdrop-blur-xl hover:shadow-[0_0_30px_rgba(212,255,0,0.15)] hover:-translate-y-1"
          >
            {/* Top Tag */}
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[#A1A1A1] group-hover:text-[#D4FF00] group-hover:border-[#D4FF00]/30 transition-colors uppercase tracking-wider mb-6">
              {partner.tag}
            </span>

            {/* Logo / Display Area */}
            <div className="h-16 flex items-center justify-center my-2 w-full">
              {partner.isText ? (
                <div className="font-techno font-black text-3xl sm:text-4xl tracking-widest text-[#A1A1A1] group-hover:text-[#D4FF00] transition-colors drop-shadow-[0_0_15px_rgba(212,255,0,0.3)]">
                  IBM
                </div>
              ) : (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-12 max-w-[140px] object-contain filter grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105"
                />
              )}
            </div>

            {/* Info */}
            <div className="mt-6 pt-4 border-t border-white/5 w-full">
              <h3 className="text-base font-bold font-techno text-white group-hover:text-[#D4FF00] transition-colors">
                {partner.name}
              </h3>
              <p className="text-xs text-[#A1A1A1] font-sans mt-1 line-clamp-2">
                {partner.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
