import React, { useRef, useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Application } from '@splinetool/runtime';
import { ROBOT_CONFIG } from '../config/robot';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface RobotCompanionProps {
  scrollProgress: number;
  isEntering?: boolean;
}

// 8 Choreographed Keyframes along scroll trajectory
interface TransformKeyframe {
  progress: number;
  x: number;      // Horizontal offset in vw
  y: number;      // Vertical offset in vh
  z: number;      // Z-depth in px
  scale: number;  // Visual scale multiplier
  rotY: number;   // Yaw in degrees
  rotX: number;   // Pitch in degrees
}

const DESKTOP_KEYFRAMES: TransformKeyframe[] = [
  // 1. Hero Section: Model positioned off-center to the right, facing slightly inward toward title
  { progress: 0.00, x: 22, y: 0, z: 0, scale: 1.05, rotY: -18, rotX: 3 },
  { progress: 0.08, x: 22, y: 0, z: 0, scale: 1.05, rotY: -18, rotX: 3 },

  // 2. Launch Mandate / Description: Model retreats along Z-axis (further back) and steps aside
  { progress: 0.15, x: 28, y: 4, z: -260, scale: 0.72, rotY: -25, rotX: 2 },
  { progress: 0.23, x: 28, y: 4, z: -260, scale: 0.72, rotY: -25, rotX: 2 },

  // 3. Day 1 Missions: Side observation
  { progress: 0.30, x: 24, y: 2, z: -140, scale: 0.85, rotY: -16, rotX: 1 },

  // 4. The Descent: Pinned 24H Hackathon showcase
  { progress: 0.44, x: 18, y: 0, z: 60, scale: 1.20, rotY: -10, rotX: 2 },
  { progress: 0.52, x: 18, y: 0, z: 60, scale: 1.20, rotY: -10, rotX: 2 },

  // 5. Tracks / Accordion Section: Model shifts to the LEFT third of viewport, facing right toward accordion
  { progress: 0.60, x: -28, y: 2, z: 0, scale: 1.02, rotY: 22, rotX: 2 },
  { progress: 0.68, x: -28, y: 2, z: 0, scale: 1.02, rotY: 22, rotX: 2 },

  // 6. Prizes / Timeline: Camera zooms into intentional focal point (core/torso) with clean symmetry
  { progress: 0.74, x: 0, y: -6, z: 140, scale: 1.25, rotY: 0, rotX: 4 },
  { progress: 0.82, x: 0, y: -6, z: 140, scale: 1.25, rotY: 0, rotX: 4 },

  // 7. Flight Plan & FAQ: Pulls back slightly to the right
  { progress: 0.86, x: 26, y: 4, z: -100, scale: 0.86, rotY: -16, rotX: 2 },
  { progress: 0.92, x: 26, y: 4, z: -100, scale: 0.86, rotY: -16, rotX: 2 },

  // 8. Final CTA & Contact: Positioned beside QR code scanner frame
  { progress: 0.96, x: 24, y: 2, z: 40, scale: 1.08, rotY: -14, rotX: 3 },
  { progress: 1.00, x: 24, y: 2, z: 40, scale: 1.08, rotY: -14, rotX: 3 }
];

const MOBILE_KEYFRAMES: TransformKeyframe[] = [
  { progress: 0.00, x: 0, y: -22, z: -80, scale: 0.68, rotY: 0, rotX: 4 },
  { progress: 0.15, x: 0, y: -24, z: -200, scale: 0.55, rotY: -10, rotX: 2 },
  { progress: 0.44, x: 0, y: -18, z: 0, scale: 0.75, rotY: 0, rotX: 2 },
  { progress: 0.62, x: 0, y: -24, z: -120, scale: 0.58, rotY: 10, rotX: 2 },
  { progress: 0.76, x: 0, y: -22, z: 40, scale: 0.72, rotY: 0, rotX: 4 },
  { progress: 1.00, x: 0, y: -20, z: 0, scale: 0.64, rotY: 0, rotX: 2 }
];

// Helper: Interpolate keyframes with smoothstep
function interpolateKeyframes(keyframes: TransformKeyframe[], progress: number): TransformKeyframe {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  if (clampedProgress <= keyframes[0].progress) return keyframes[0];
  if (clampedProgress >= keyframes[keyframes.length - 1].progress) return keyframes[keyframes.length - 1];

  let i = 0;
  while (i < keyframes.length - 1 && keyframes[i + 1].progress < clampedProgress) {
    i++;
  }

  const k1 = keyframes[i];
  const k2 = keyframes[i + 1];
  const range = k2.progress - k1.progress;
  const rawT = range > 0 ? (clampedProgress - k1.progress) / range : 0;
  // Cubic smoothstep easing: 3t^2 - 2t^3
  const t = rawT * rawT * (3 - 2 * rawT);

  return {
    progress: clampedProgress,
    x: k1.x + (k2.x - k1.x) * t,
    y: k1.y + (k2.y - k1.y) * t,
    z: k1.z + (k2.z - k1.z) * t,
    scale: k1.scale + (k2.scale - k1.scale) * t,
    rotY: k1.rotY + (k2.rotY - k1.rotY) * t,
    rotX: k1.rotX + (k2.rotX - k1.rotX) * t
  };
}

export const RobotCompanion: React.FC<RobotCompanionProps> = ({ scrollProgress, isEntering = true }) => {
  const splineAppRef = useRef<Application | null>(null);
  const headObjectRef = useRef<any>(null);
  const bodyObjectRef = useRef<any>(null);

  // Direct DOM Refs for 60/120fps GPU Hardware Acceleration (Zero React re-render overhead!)
  const stageRef = useRef<HTMLDivElement>(null);
  const rimLightRef = useRef<HTMLDivElement>(null);

  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for animation loop (Prevents loop recreation and state lag)
  const scrollProgressRef = useRef(scrollProgress);
  const isEnteringRef = useRef(isEntering);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseSmooth = useRef({ x: 0, y: 0 });

  // Current smoothed 3D transform (Starts centered/deep if loading, then blooms into hero)
  const transformSmooth = useRef({
    x: isEntering ? 22 : 0,
    y: isEntering ? 0 : 0,
    z: isEntering ? 0 : -220,
    scale: isEntering ? 1.05 : 0.65,
    rotY: isEntering ? -18 : 0,
    rotX: isEntering ? 3 : 0
  });

  // Keep refs updated without restarting the render loop
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    isEnteringRef.current = isEntering;
  }, [isEntering]);

  // Track screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track mouse coordinates for subtle parallax
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // Spline scene load callback
  const handleLoad = useCallback((splineApp: Application) => {
    splineAppRef.current = splineApp;
    setIsLoaded(true);

    try {
      const allObjects = splineApp.getAllObjects();
      headObjectRef.current = splineApp.findObjectByName(ROBOT_CONFIG.HEAD_OBJECT_NAME) ||
                              allObjects.find((o) => o.name?.toLowerCase().includes('head')) ||
                              null;

      bodyObjectRef.current = splineApp.findObjectByName(ROBOT_CONFIG.BODY_OBJECT_NAME) ||
                              allObjects.find((o) => o.name?.toLowerCase().includes('body')) ||
                              null;
    } catch (err) {
      console.warn('Spline object audit error:', err);
    }
  }, []);

  // PERSISTENT, HIGH-PERFORMANCE 60FPS / 120FPS RENDER LOOP
  // Never unmounts or recreates during scroll - updates DOM styles directly!
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // 1. Calculate Target Transform
      let targetTransform: TransformKeyframe;
      
      if (!isEnteringRef.current) {
        // Deep centered origin state matching video helmet ending clip
        targetTransform = {
          progress: 0,
          x: 0,
          y: 0,
          z: -220,
          scale: 0.68,
          rotY: 0,
          rotX: 0
        };
      } else {
        const keyframes = isMobile ? MOBILE_KEYFRAMES : DESKTOP_KEYFRAMES;
        targetTransform = interpolateKeyframes(keyframes, scrollProgressRef.current);
      }

      // 2. Smooth lerp for model coordinates (Clean damping, zero hitching)
      const lerpFactor = Math.min(1, dt * 5.8);
      const curr = transformSmooth.current;

      curr.x += (targetTransform.x - curr.x) * lerpFactor;
      curr.y += (targetTransform.y - curr.y) * lerpFactor;
      curr.z += (targetTransform.z - curr.z) * lerpFactor;
      curr.scale += (targetTransform.scale - curr.scale) * lerpFactor;
      curr.rotY += (targetTransform.rotY - curr.rotY) * lerpFactor;
      curr.rotX += (targetTransform.rotX - curr.rotX) * lerpFactor;

      // 3. Smooth mouse parallax
      mouseSmooth.current.x += (mouseTarget.current.x - mouseSmooth.current.x) * lerpFactor;
      mouseSmooth.current.y += (mouseTarget.current.y - mouseSmooth.current.y) * lerpFactor;

      // 4. Update head and torso rotation (Constrained within realistic bounds)
      const headYawRad = (curr.rotY * Math.PI) / 180 + (mouseSmooth.current.x * 22 * Math.PI) / 180;
      const headPitchRad = (curr.rotX * Math.PI) / 180 - (mouseSmooth.current.y * 14 * Math.PI) / 180;

      if (headObjectRef.current) {
        headObjectRef.current.rotation.y = headYawRad;
        headObjectRef.current.rotation.x = headPitchRad;
      }

      if (bodyObjectRef.current) {
        bodyObjectRef.current.rotation.y = (curr.rotY * 0.35 * Math.PI) / 180 + (mouseSmooth.current.x * 8 * Math.PI) / 180;
        bodyObjectRef.current.rotation.x = (curr.rotX * 0.35 * Math.PI) / 180 - (mouseSmooth.current.y * 5 * Math.PI) / 180;
      }

      // 5. Direct GPU Transform Updates (NO React re-renders!)
      if (stageRef.current) {
        stageRef.current.style.transform = `translate3d(${curr.x}vw, ${curr.y}vh, ${curr.z}px) scale(${curr.scale})`;
      }

      if (rimLightRef.current) {
        rimLightRef.current.style.transform = `translate3d(calc(-50% + ${curr.x}vw), calc(-50% + ${curr.y}vh), 0px) scale(${curr.scale * 1.35})`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isMobile]); // Loop only restarts if viewport orientation flips

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
      
      {/* 1. Directional Edge / Rim Light Behind Metallic Robot (Electric Neon Green & Ice Blue) */}
      <div
        ref={rimLightRef}
        style={{
          opacity: isLoaded ? 0.9 : 0,
          willChange: 'transform'
        }}
        className="absolute top-1/2 left-1/2 w-[540px] h-[540px] rounded-full pointer-events-none blur-[75px] bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.38)_0%,rgba(0,240,255,0.22)_42%,transparent_72%)] transition-opacity duration-700"
      />

      {/* 2. 3D Model Stage Canvas */}
      <div
        ref={stageRef}
        style={{
          transformOrigin: 'center center',
          willChange: 'transform'
        }}
        className="w-full h-full flex items-center justify-center pointer-events-none"
      >
        <div className="w-[100vw] h-[100vh] max-w-[1250px] max-h-[920px] relative pointer-events-none">
          {hasError ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={ROBOT_CONFIG.FALLBACK_IMAGE}
                alt="3D Robot Companion"
                className="w-80 h-80 object-contain filter drop-shadow-[0_0_35px_rgba(204,255,0,0.5)]"
              />
            </div>
          ) : (
            <Suspense fallback={null}>
              <Spline
                scene={ROBOT_CONFIG.SCENE_URL}
                onLoad={handleLoad}
                onError={() => setHasError(true)}
                className="w-full h-full pointer-events-none"
              />
            </Suspense>
          )}
        </div>
      </div>

    </div>
  );
};

export default RobotCompanion;
