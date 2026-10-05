import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BlackHoleProps {
  scrollProgress: number;
  onPulse?: () => void;
}

export const BlackHole: React.FC<BlackHoleProps> = ({ scrollProgress }) => {
  const diskRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const shockwaveProgress = useRef(1.0);

  // Particles swirling into the accretion disk
  const particleCount = 650;
  const [particlePositions, particleColors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const warmColor = new THREE.Color('#FFF1D0');
    const limeColor = new THREE.Color('#D4FF00');

    for (let i = 0; i < particleCount; i++) {
      const radius = THREE.MathUtils.randFloat(3.2, 8.5);
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = THREE.MathUtils.randFloat(-0.25, 0.25);
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      // Color interpolation from warm white inner to electric lime outer
      const t = (radius - 3.2) / 5.3;
      const c = warmColor.clone().lerp(limeColor, t);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  // Trigger shockwave on click
  const triggerPulse = () => {
    shockwaveProgress.current = 0.0;
  };

  useFrame((_, delta) => {
    // Rotate the accretion disk
    if (diskRef.current) {
      diskRef.current.rotation.z += delta * 0.45;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.25;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.5;
    }

    // Shockwave expansion animation
    if (shockwaveRef.current && shockwaveProgress.current < 1.0) {
      shockwaveProgress.current += delta * 1.5;
      const scale = THREE.MathUtils.lerp(3.2, 14, shockwaveProgress.current);
      shockwaveRef.current.scale.set(scale, scale, scale);
      const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (1.0 - shockwaveProgress.current) * 0.8;
    }
  });

  // Calculate dynamic scale & position based on scroll (camera approaches black hole during hackathon descent)
  const isHackathonSection = scrollProgress > 0.35 && scrollProgress < 0.75;
  const targetScale = isHackathonSection ? 1.4 : 1.0;

  return (
    <group position={[0, 0, -12]} onClick={triggerPulse}>
      {/* 1. Event Horizon: True Infinite Black Sphere */}
      <mesh>
        <sphereGeometry args={[2.5, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. Gravitational Lensing Glowing Ring (Warm core to Lime edge) */}
      <mesh ref={ringRef} rotation={[0, 0, 0]}>
        <ringGeometry args={[2.55, 3.4, 64]} />
        <meshBasicMaterial
          color="#FFF1D0"
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Outer Accretion Ring (Electric Lime Glow) */}
      <mesh ref={diskRef} rotation={[Math.PI * 0.35, 0, 0]}>
        <ringGeometry args={[2.7, 6.8, 64]} />
        <meshBasicMaterial
          color="#D4FF00"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Swirling Accretion Particles */}
      <points ref={particlesRef} rotation={[Math.PI * 0.35, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 5. Interactive Gravitational Shockwave Ripple */}
      <mesh ref={shockwaveRef} rotation={[Math.PI * 0.5, 0, 0]}>
        <ringGeometry args={[1, 1.15, 64]} />
        <meshBasicMaterial
          color="#D4FF00"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
