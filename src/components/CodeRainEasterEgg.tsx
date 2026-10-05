import React, { useEffect, useRef, useState } from 'react';

export const CodeRainEasterEgg: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keySequence = useRef('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      keySequence.current += e.key.toLowerCase();
      if (keySequence.current.length > 10) {
        keySequence.current = keySequence.current.slice(-10);
      }

      if (keySequence.current.endsWith('code')) {
        setIsActive(true);
        setTimeout(() => setIsActive(false), 3200);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ</>{}=>*_#$@';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    let animationFrameId: number;

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 3, 4, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#D4FF00';
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[99990] pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/80 border border-[#D4FF00] px-4 py-2 text-[#D4FF00] font-mono text-sm shadow-[0_0_20px_#D4FF00]">
        ⚡ [EASTER EGG ACTIVATED]: LIME CODE PROTOCOL INJECTED
      </div>
    </div>
  );
};
