import React from 'react';

const ROW1 = [
  "CODE MEET 2026",
  "24 HRS HACKATHON",
  "BEYOND THE EVENT HORIZON",
  "SUIET MUKKA",
  "WEBFLOW COMMUNITY",
  "RETURN FUTURE();"
];

const ROW2 = [
  "Rs 50,000 PRIZE POOL",
  "SPEED TYPING",
  "FREE FIRE",
  "TREASURE HUNT",
  "FOUR PROBLEM STATEMENTS",
  "ROUND 1 FREE"
];

export const MarqueeSection: React.FC = () => {
  return (
    <div className="relative w-full py-6 bg-[#030304] border-y border-[#D4FF00]/15 overflow-hidden z-20 select-none space-y-3">
      
      {/* Row 1 (Moving Left) */}
      <div className="flex w-max animate-marquee">
        {[...ROW1, ...ROW1].map((item, idx) => (
          <div key={idx} className="flex items-center mx-5 text-sm sm:text-base font-techno font-black tracking-widest text-white/90">
            <span>{item}</span>
            <span className="text-[#D4FF00] text-xl ml-8 font-mono">*</span>
          </div>
        ))}
      </div>

      {/* Row 2 (Moving Right, Outlined Techno Font) */}
      <div className="flex w-max" style={{ animation: 'marquee 28s linear infinite reverse' }}>
        {[...ROW2, ...ROW2].map((item, idx) => (
          <div key={idx} className="flex items-center mx-5 text-sm sm:text-base font-techno font-bold tracking-widest text-transparent border-text">
            <span>{item}</span>
            <span className="text-[#FFF1D0] text-xl ml-8 font-mono">*</span>
          </div>
        ))}
      </div>

    </div>
  );
};
