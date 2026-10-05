import React, { useState } from 'react';
import { ArrowUpRight, ChevronDown, Cpu, ShieldCheck, Globe, Sparkles } from 'lucide-react';
import { sfx } from '../components/Navbar';

interface TrackItem {
  id: string;
  number: string;
  title: string;
  category: string;
  desc: string;
  status: string;
  icon: any;
  techTags: string[];
}

const TRACKS: TrackItem[] = [
  {
    id: "ai-neural",
    number: "01",
    title: "AI & NEURAL SINGULARITY",
    category: "AUTONOMOUS AGENTS // LOCAL LLM // PREDICTIVE TELEMETRY",
    desc: "Architect self-governing multi-agent workflows, edge inference pipelines, or generative tools that operate under extreme high-entropy constraints.",
    status: "CLASSIFIED // TODO: replace with official problem statement",
    icon: Sparkles,
    techTags: ["Autonomous Agents", "Edge Models", "Vector Memory", "Synthetic Data"]
  },
  {
    id: "web3-crypto",
    number: "02",
    title: "DECENTRALIZED PROTOCOLS",
    category: "ZERO-KNOWLEDGE // TRUSTLESS COMPUTE // PEER VERIFICATION",
    desc: "Build cryptographic verification mechanisms, decentralized data layers, or resilient infrastructure impervious to single-point failure.",
    status: "CLASSIFIED // TODO: replace with official problem statement",
    icon: ShieldCheck,
    techTags: ["ZK Proofs", "Decentralized Compute", "State Channels", "Consensus"]
  },
  {
    id: "cyber-hardware",
    number: "03",
    title: "HARDWARE-SOFTWARE NEXUS",
    category: "EMBEDDED SYSTEMS // ROBOTICS // SENSORY TELEMETRY",
    desc: "Bridge physical circuits with real-time software logic. High-speed IoT feedback, robotic controllers, or sensor array diagnostics.",
    status: "CLASSIFIED // TODO: replace with official problem statement",
    icon: Cpu,
    techTags: ["Sensory Arrays", "Robotics Control", "Microcontrollers", "Telemetry"]
  },
  {
    id: "open-frontier",
    number: "04",
    title: "OPEN FRONTIER INNOVATION",
    category: "CLIMATE TECH // CRISIS RESPONSE // RAPID INFRASTRUCTURE",
    desc: "Unrestricted problem domain. High-impact software engineered for extreme community utility, educational velocity, or emergency resilience.",
    status: "CLASSIFIED // TODO: replace with official problem statement",
    icon: Globe,
    techTags: ["Emergency Tech", "Civic Systems", "Open Source", "Scalable Logic"]
  }
];

export const TracksSection: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<string>(TRACKS[0].id);

  const currentTrackData = TRACKS.find(t => t.id === activeTrack) || TRACKS[0];

  return (
    <section id="tracks" className="relative py-28 md:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      
      {/* 2-Column Split: Left 1/3 (Col 5) vs Right 2/3 (Col 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column (lg:col-span-5): Sticky Header & Context (Model shifts to this third) */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-xs font-mono text-[#D4FF00] tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse" />
              <span>// CLASSIFIED PROBLEM VECTORS 03</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-techno text-white tracking-tight leading-tight">
              HACKATHON <br />
              <span className="text-[#D4FF00] drop-shadow-[0_0_25px_rgba(204,255,0,0.5)]">TRACKS</span>
            </h2>

            <p className="text-sm sm:text-base text-[#A1A1A1] font-sans font-light mt-3 leading-relaxed">
              Four classified problem domains released for Round 1 screening. Squads select one track to build an audacious working prototype.
            </p>
          </div>

          {/* Active Track Telemetry Glass Card */}
          <div className="glass-panel p-5 sm:p-6 rounded-xl space-y-3">
            <div className="text-xs font-mono text-[#D4FF00] flex items-center justify-between">
              <span>// ACTIVE FOCUS VECTOR</span>
              <span className="text-white/40">TRACK {currentTrackData.number}</span>
            </div>
            
            <div className="text-lg sm:text-xl font-bold font-techno text-white">
              {currentTrackData.title}
            </div>

            <p className="text-xs font-mono text-[#A1A1A1] line-clamp-2">
              {currentTrackData.category}
            </p>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#FFF1D0]">
              <span>STATUS: ROUND 1 READY</span>
              <span className="text-[#D4FF00]">FREE SUBMISSION</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-white/40">
            // NOTE: TODO: replace with final problem statement briefs upon release
          </div>

        </div>

        {/* Right Column (lg:col-span-7): 4 Glassmorphism Accordion Panels */}
        <div className="lg:col-span-7 space-y-4">
          {TRACKS.map((track) => {
            const isOpen = activeTrack === track.id;
            const Icon = track.icon;

            return (
              <div
                key={track.id}
                onClick={() => {
                  setActiveTrack(track.id);
                  sfx.playClick();
                }}
                className={`rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                  isOpen ? 'glass-panel-active' : 'glass-panel hover:border-white/30'
                }`}
              >
                {/* Header Row */}
                <div className="p-6 sm:p-7 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className={`text-2xl sm:text-3xl font-mono font-black transition-colors ${
                      isOpen ? 'text-[#D4FF00]' : 'text-white/40 group-hover:text-white'
                    }`}>
                      {track.number}
                    </span>

                    <div>
                      <h3 className={`text-xl sm:text-2xl font-bold font-techno transition-colors ${
                        isOpen ? 'text-white' : 'text-white/80 hover:text-white'
                      }`}>
                        {track.title}
                      </h3>
                      <div className="text-[11px] font-mono text-[#A1A1A1] mt-0.5">
                        {track.category}
                      </div>
                    </div>
                  </div>

                  <div className={`p-2 rounded-full transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180 bg-[#D4FF00] text-black' : 'bg-white/5 text-[#D4FF00]'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Expanded Accordion Content */}
                {isOpen && (
                  <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-2 border-t border-white/10 space-y-5 animate-fadeIn">
                    <p className="text-sm sm:text-base text-white/90 font-sans leading-relaxed">
                      {track.desc}
                    </p>

                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {track.techTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/25 text-[11px] font-mono text-[#D4FF00]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs font-mono">
                      <span className="text-[#FFF1D0]">{track.status}</span>
                      <a
                        href="#final-cta"
                        onClick={(e) => {
                          e.stopPropagation();
                          sfx.playClick();
                        }}
                        className="inline-flex items-center gap-1 text-[#D4FF00] hover:underline font-bold"
                      >
                        <span>REGISTER FOR THIS TRACK</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
};
