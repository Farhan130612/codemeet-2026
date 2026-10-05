import React, { useState } from 'react';
import { EVENT_CONFIG } from '../data/content';
import { Clock, Calendar, MapPin, Compass, CheckCircle } from 'lucide-react';
import { sfx } from '../components/Navbar';

export const ScheduleSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'day1' | 'day23'>('day23');

  const currentTimeline = activeTab === 'day1' ? EVENT_CONFIG.schedule.day1 : EVENT_CONFIG.schedule.day23;

  return (
    <section id="schedule" className="relative py-28 md:py-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
      
      {/* 2-Column Split: Sticky Flight Parameters (Left) vs. Scrolling Trajectory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Sticky Flight Overview & Tab Switcher */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-8">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/30 text-xs font-mono text-[#D4FF00] tracking-widest uppercase mb-4">
              <Clock className="w-3.5 h-3.5 fill-[#D4FF00]" />
              <span>// FLIGHT PLAN &amp; TRAJECTORY</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-techno text-white tracking-tight leading-tight">
              MISSION <span className="text-[#D4FF00] drop-shadow-[0_0_25px_rgba(212,255,0,0.4)]">CHRONOLOGY</span>
            </h2>

            <p className="text-sm sm:text-base text-[#A1A1A1] font-sans font-light mt-3 leading-relaxed">
              Every milestone is synchronized to ensure peak execution. Day 1 tests individual reflexes; Days 2 and 3 plunge directly into 24 hours of autonomous hackathon building.
            </p>
          </div>

          {/* Interactive Day Switcher Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            
            {/* Tab Day 1 */}
            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab('day1');
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                activeTab === 'day1'
                  ? 'bg-[#D4FF00]/15 border-[#D4FF00] shadow-[0_0_25px_rgba(212,255,0,0.25)]'
                  : 'bg-[#0A0A0A]/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${activeTab === 'day1' ? 'bg-[#D4FF00] text-black' : 'bg-white/5 text-[#A1A1A1]'}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-xs font-mono font-bold tracking-wider ${activeTab === 'day1' ? 'text-[#D4FF00]' : 'text-[#A1A1A1]'}`}>
                    DAY 01 // 31 OCT 2026
                  </div>
                  <div className="text-base font-bold font-techno text-white">
                    Orbital Missions
                  </div>
                  <div className="text-xs text-[#A1A1A1] font-mono mt-0.5">
                    Speed Typing • Free Fire • Treasure Hunt
                  </div>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${activeTab === 'day1' ? 'bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]' : 'bg-white/20'}`} />
            </button>

            {/* Tab Day 2-3 */}
            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab('day23');
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                activeTab === 'day23'
                  ? 'bg-[#D4FF00]/15 border-[#D4FF00] shadow-[0_0_25px_rgba(212,255,0,0.25)]'
                  : 'bg-[#0A0A0A]/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${activeTab === 'day23' ? 'bg-[#D4FF00] text-black' : 'bg-white/5 text-[#A1A1A1]'}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-xs font-mono font-bold tracking-wider ${activeTab === 'day23' ? 'text-[#D4FF00]' : 'text-[#A1A1A1]'}`}>
                    DAY 02–03 // 01–02 NOV 2026
                  </div>
                  <div className="text-base font-bold font-techno text-white">
                    24-Hour Hackathon
                  </div>
                  <div className="text-xs text-[#A1A1A1] font-mono mt-0.5">
                    Continuous Descent • Zero Sleeping Protocol
                  </div>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${activeTab === 'day23' ? 'bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]' : 'bg-white/20'}`} />
            </button>

          </div>

          {/* Mission Parameters Card */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-3 font-mono text-xs">
            <div className="text-[#D4FF00] font-bold flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D4FF00]" />
              <span>ORBITAL COORDINATES</span>
            </div>
            <div className="flex items-start gap-2 text-[#A1A1A1]">
              <MapPin className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" />
              <span>SUIET Campus, Mukka, Mangaluru (NH 66)</span>
            </div>
            <div className="flex items-center gap-2 text-[#A1A1A1]">
              <CheckCircle className="w-3.5 h-3.5 text-[#D4FF00] shrink-0" />
              <span>Mandatory Physical Check-in for Onsite Hackers</span>
            </div>
            <div className="text-[10px] text-white/40 pt-2 border-t border-white/5">
              // TODO: replace with confirmed minute-by-minute timetable
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Scrolling Timeline */}
        <div className="lg:col-span-7">
          <div className="relative pl-6 sm:pl-10 space-y-8 sm:space-y-10">
            
            {/* Continuous Vertical Glowing Lime Trajectory Rail */}
            <div className="absolute left-[11px] sm:left-[15px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#D4FF00] via-[#D4FF00]/50 to-[#D4FF00]/10 shadow-[0_0_12px_rgba(212,255,0,0.6)]" />

            {currentTimeline.map((item, i) => (
              <div key={i} className="relative group">
                
                {/* Glowing Node Dot */}
                <div className="absolute -left-[30px] sm:-left-[42px] top-1.5 w-4 h-4 rounded-full bg-[#030304] border-2 border-[#D4FF00] group-hover:bg-[#D4FF00] group-hover:scale-125 transition-all shadow-[0_0_14px_#D4FF00] z-10" />

                {/* Milestone Content Box */}
                <div className="p-6 sm:p-7 rounded-2xl glass-panel group-hover:border-[#D4FF00]/60 transition-all">
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="inline-block font-mono text-xs font-bold text-[#D4FF00] px-2.5 py-1 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/30 tracking-wider">
                      {item.time}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      MILESTONE 0{i + 1}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-techno text-white group-hover:text-[#D4FF00] transition-colors mt-2">
                    {item.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#A1A1A1] font-sans font-light mt-2 leading-relaxed">
                    {item.desc}
                  </p>

                </div>

              </div>
            ))}

          </div>
        </div>

      </div>

    </section>
  );
};
