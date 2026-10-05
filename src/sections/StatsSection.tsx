import React, { useEffect, useState, useRef } from 'react';
import { EVENT_CONFIG } from '../data/content';

export const StatsSection: React.FC = () => {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="relative py-16 px-4 md:px-8 max-w-7xl mx-auto z-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {EVENT_CONFIG.stats.map((stat, i) => (
          <div
            key={i}
            className="bracket-frame p-6 rounded-lg text-center flex flex-col items-center justify-center hover:border-[#D4FF00] transition-colors group"
          >
            <div className="text-[10px] font-mono text-[#D4FF00] tracking-widest uppercase mb-1">
              // TELEMETRY 0{i + 1}
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black font-techno text-white group-hover:text-[#D4FF00] transition-colors my-1 tracking-tight">
              {stat.prefix}
              {inView ? stat.value : 0}
              {stat.suffix}
            </div>
            <div className="text-xs text-[#A1A1A1] font-mono">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
