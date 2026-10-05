import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Starfield } from './Starfield';
import { BlackHole } from './BlackHole';
import { FloatingCodeGlyphs } from './FloatingCodeGlyphs';
import { AsteriskBeacon } from './AsteriskBeacon';
import { OrbitPlanets } from './OrbitPlanets';
import { GridFloor } from './GridFloor';

interface SceneCanvasProps {
  scrollProgress: number;
  isEntering?: boolean;
}

// Camera Director navigating the continuous space journey with forward entrance zoom
const CameraDirector: React.FC<{ scrollProgress: number; isEntering: boolean; mouse: React.MutableRefObject<{ x: number; y: number }> }> = ({
  scrollProgress,
  isEntering,
  mouse
}) => {
  useFrame((state, delta) => {
    let baseZ = isEntering ? (5 - scrollProgress * 10) : 8.5;
    let targetZ = baseZ;
    let targetX = mouse.current.x * 0.3;
    let targetY = mouse.current.y * 0.2;

    if (window.innerWidth < 1024) {
      targetZ = isEntering ? (6 - scrollProgress * 8) : 9.5;
      targetY += 0.2;
    }

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, delta * 3);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, delta * 3);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * (isEntering ? 3.5 : 2));

    state.camera.lookAt(0, 0, -6);
  });

  return null;
};

export const SceneCanvas: React.FC<SceneCanvasProps> = ({ scrollProgress, isEntering = true }) => {
  const mouse = useRef({ x: 0, y: 0 });
  const [dpr, setDpr] = useState(1.5);
  const [starCount, setStarCount] = useState(1200);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setDpr(isMobile ? Math.min(window.devicePixelRatio, 1.2) : Math.min(window.devicePixelRatio, 1.8));
    setStarCount(isMobile ? 500 : 1400);

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden bg-[#030304]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 200 }}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false
        }}
      >
        <Suspense fallback={null}>
          <CameraDirector scrollProgress={scrollProgress} isEntering={isEntering} mouse={mouse} />

          {/* Deep Space Lighting & Directional Rim Highlights */}
          <ambientLight intensity={0.35} />
          <directionalLight position={[5, 5, 4]} intensity={1.3} color="#CCFF00" />
          <pointLight position={[-6, -3, -4]} intensity={0.7} color="#FFF1D0" />

          {/* Strong Directional Edge / Rim Lights (Electric Neon Green & Ice Blue) */}
          <directionalLight position={[-6, 5, -8]} intensity={3.5} color="#CCFF00" />
          <pointLight position={[6, -3, -6]} intensity={2.8} color="#00F0FF" />

          {/* Background Space Atmosphere */}
          <Starfield count={starCount} mouse={mouse} />
          <BlackHole scrollProgress={scrollProgress} />
          <FloatingCodeGlyphs />
          <AsteriskBeacon scrollProgress={scrollProgress} />
          <OrbitPlanets scrollProgress={scrollProgress} />
          <GridFloor scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
};
