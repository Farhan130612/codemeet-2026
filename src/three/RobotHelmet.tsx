import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface RobotHelmetProps {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  scrollProgress: number;
}

export const RobotHelmet: React.FC<RobotHelmetProps> = ({ mouse, scrollProgress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [touchDelta, setTouchDelta] = useState({ x: 0, y: 0 });

  // Load the official helmet texture
  const helmetTexture = useTexture('/assets/helmet.png');
  helmetTexture.generateMipmaps = true;
  helmetTexture.minFilter = THREE.LinearMipmapLinearFilter;

  // Handle touch drag on mobile
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isTouching = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouching = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouching || e.touches.length !== 1) return;
      const dx = (e.touches[0].clientX - startX) * 0.004;
      const dy = (e.touches[0].clientY - startY) * 0.004;
      setTouchDelta({ x: dx, y: dy });
    };

    const onTouchEnd = () => {
      isTouching = false;
      // Gently return to center
      setTimeout(() => setTouchDelta({ x: 0, y: 0 }), 1200);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Desktop mouse look-at (+/- 20 degrees = ~0.35 rad) combined with mobile touch
    const targetRotY = (mouse.current.x * 0.38) + touchDelta.x;
    const targetRotX = (-mouse.current.y * 0.25) - touchDelta.y;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, delta * 4);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, delta * 4);

    // Subtle floating breathing motion
    const time = state.clock.getElapsedTime();
    const floatOffset = Math.sin(time * 1.5) * 0.08;

    // Camera/scroll progression:
    // In Hero (0.0): Centered right on desktop, centered on mobile.
    // In About/Events (0.2 - 0.5): glides back and left slightly as camera moves past.
    // In Hackathon (0.5 - 0.7): moves forward into singularity.
    let targetX = 1.6;
    let targetY = floatOffset;
    let targetZ = 0;
    let targetScale = 1.0;

    // Detect mobile vs desktop view width
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      targetX = 0;
      targetY = 0.8 + floatOffset;
      targetScale = 0.82;
    }

    if (scrollProgress > 0.15) {
      // Pull back as we scroll past hero
      targetZ = -scrollProgress * 6;
      targetX += scrollProgress * (isMobile ? 0 : 2);
    }

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 3);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 3);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 3);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 3));
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Layer 1: Back shadow / volumetric occlusion plane */}
      <mesh position={[0, -0.05, -0.15]}>
        <planeGeometry args={[3.2, 3.6]} />
        <meshBasicMaterial
          map={helmetTexture}
          transparent
          opacity={0.35}
          color="#000000"
        />
      </mesh>

      {/* Layer 2: Main Glossy Robot Helmet */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[3.1, 3.5]} />
        <meshBasicMaterial
          map={helmetTexture}
          transparent
          opacity={0.98}
        />
      </mesh>

      {/* Layer 3: Emissive Glowing Lime Visor Bar & Accretion Reflection */}
      <mesh position={[0, 0.05, 0.08]}>
        <planeGeometry args={[2.0, 0.42]} />
        <meshBasicMaterial
          color="#D4FF00"
          transparent
          opacity={hovered ? 0.75 : 0.45}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Layer 4: Soft Warm Accretion Ring Reflection Glint */}
      <mesh position={[-0.45, 0.35, 0.06]}>
        <planeGeometry args={[0.9, 0.15]} />
        <meshBasicMaterial
          color="#FFF1D0"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
