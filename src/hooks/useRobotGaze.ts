import { useEffect, useRef } from 'react';

export interface GazeTarget {
  x: number; // -1 to 1 normalized
  y: number; // -1 to 1 normalized
}

export function useRobotGaze(
  wrapperRef: React.RefObject<HTMLDivElement>,
  onGazeUpdate: (headRot: { x: number; y: number }, bodyRot: { x: number; y: number }) => void
) {
  const currentHeadRot = useRef({ x: 0, y: 0 });
  const currentBodyRot = useRef({ x: 0, y: 0 });
  const targetGaze = useRef<GazeTarget>({ x: 0, y: 0 });
  const lastInputTime = useRef(Date.now());
  const idleGlanceOffset = useRef({ x: 0, y: 0 });
  const isIdle = useRef(false);

  // Maximum rotation angles (in radians)
  const MAX_YAW = (35 * Math.PI) / 180;   // +/- 35 deg
  const MAX_PITCH = (20 * Math.PI) / 180; // +/- 20 deg
  const DAMPING = 0.08;

  useEffect(() => {
    // 1. Pointer move tracking relative to robot on-screen center
    const onPointerMove = (e: PointerEvent) => {
      lastInputTime.current = Date.now();
      isIdle.current = false;

      // Check if hovering an element with [data-robot-target]
      const targetEl = (e.target as HTMLElement)?.closest('[data-robot-target]');
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;
        calculateRelativeGaze(elCenterX, elCenterY);
        return;
      }

      calculateRelativeGaze(e.clientX, e.clientY);
    };

    // 2. Touch move tracking for mobile
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastInputTime.current = Date.now();
        isIdle.current = false;
        calculateRelativeGaze(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const calculateRelativeGaze = (clientX: number, clientY: number) => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const robotCenterX = rect.left + rect.width / 2;
      const robotCenterY = rect.top + rect.height * 0.4; // Robot head height approximation

      // Normalize relative to robot center
      const rawX = (clientX - robotCenterX) / (window.innerWidth / 2);
      const rawY = (clientY - robotCenterY) / (window.innerHeight / 2);

      // Clamp between -1 and 1
      targetGaze.current = {
        x: Math.max(-1, Math.min(1, rawX)),
        y: Math.max(-1, Math.min(1, rawY))
      };
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchMove, { passive: true });

    // 3. Animation loop with requestAnimationFrame
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Check idle behavior after 3 seconds of no interaction
      const elapsed = Date.now() - lastInputTime.current;
      if (elapsed > 3000) {
        isIdle.current = true;
        // Breathing bob & subtle glance
        const t = now * 0.0015;
        idleGlanceOffset.current.x = Math.sin(t * 0.7) * 0.18;
        idleGlanceOffset.current.y = Math.cos(t * 1.2) * 0.1;
      } else {
        idleGlanceOffset.current.x = 0;
        idleGlanceOffset.current.y = 0;
      }

      const finalTargetX = (targetGaze.current.x + idleGlanceOffset.current.x) * MAX_YAW;
      const finalTargetY = (targetGaze.current.y + idleGlanceOffset.current.y) * MAX_PITCH;

      // Delta-time smoothed lerp (damping ~0.08 per frame)
      const factor = 1 - Math.pow(1 - DAMPING, delta * 60);

      currentHeadRot.current.x += (finalTargetY - currentHeadRot.current.x) * factor;
      currentHeadRot.current.y += (finalTargetX - currentHeadRot.current.y) * factor;

      // Body turns slightly (~30% of head rotation) for natural realism
      currentBodyRot.current.x = currentHeadRot.current.x * 0.3;
      currentBodyRot.current.y = currentHeadRot.current.y * 0.3;

      onGazeUpdate(currentHeadRot.current, currentBodyRot.current);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [wrapperRef, onGazeUpdate]);
}
