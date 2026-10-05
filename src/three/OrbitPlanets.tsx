import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitPlanetsProps {
  scrollProgress: number;
}

export const OrbitPlanets: React.FC<OrbitPlanetsProps> = ({ scrollProgress }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.2;
  });

  // Visible during EVENTS and TRACKS sections (~0.25 to 0.70)
  const isVisible = scrollProgress > 0.2 && scrollProgress < 0.75;
  if (!isVisible) return null;

  return (
    <group ref={groupRef} position={[2.2, 0, -4]}>
      {/* Orbit 1: Speed Typing Planet */}
      <group position={[2.5, 0.8, 0]}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#080808"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        {/* Lime Rim Glow */}
        <mesh>
          <sphereGeometry args={[0.54, 32, 32]} />
          <meshBasicMaterial
            color="#D4FF00"
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      </group>

      {/* Orbit 2: Free Fire Planet */}
      <group position={[-2.8, -0.6, 1.2]}>
        <mesh>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial
            color="#0A0A0A"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.46, 32, 32]} />
          <meshBasicMaterial
            color="#D4FF00"
            transparent
            opacity={0.35}
            side={THREE.BackSide}
          />
        </mesh>
      </group>

      {/* Orbit 3: Treasure Hunt Planet */}
      <group position={[0.5, -1.8, -1.5]}>
        <mesh>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial
            color="#050505"
            roughness={0.9}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.41, 32, 32]} />
          <meshBasicMaterial
            color="#FFF1D0"
            transparent
            opacity={0.25}
            side={THREE.BackSide}
          />
        </mesh>
      </group>

      {/* Orbit Line Ring */}
      <mesh rotation={[Math.PI * 0.4, 0, 0]}>
        <ringGeometry args={[2.48, 2.52, 64]} />
        <meshBasicMaterial
          color="#D4FF00"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
