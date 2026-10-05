import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop with fine mouse pointer
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('a, button, input, [role="button"], [data-cursor="pointer"]');
      setIsHovered(!!interactive);

      const card = target.closest('[data-cursor="card"]');
      setIsCardHovered(!!card);
    };

    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Central Lime Dot */}
      <div
        className="fixed w-2 h-2 rounded-full bg-[#D4FF00] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out shadow-[0_0_10px_#D4FF00]"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      />

      {/* Expanding Ring */}
      <div
        className={`fixed rounded-full border border-[#D4FF00] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out flex items-center justify-center font-mono text-[10px] text-[#D4FF00] font-bold ${
          isCardHovered
            ? 'w-14 h-14 bg-[rgba(212,255,0,0.12)] backdrop-blur-[2px]'
            : isHovered
            ? 'w-10 h-10 bg-[rgba(212,255,0,0.08)] scale-110'
            : 'w-7 h-7 opacity-60'
        }`}
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      >
        {isCardHovered && '</>'}
      </div>
    </div>
  );
};
