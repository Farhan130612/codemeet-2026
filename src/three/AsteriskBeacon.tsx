import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteriskBeaconProps {
  scrollProgress: number;
}

export const AsteriskBeacon: React.FC<AsteriskBeaconProps> = ({ scrollProgress }) => {
  const meshGroup = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!meshGroup.current) return;
    // Rotate like a rotating orbital space beacon
    meshGroup.current.rotation.z += delta * 0.6;
    meshGroup.current.rotation.y += delta * 0.35;
    meshGroup.current.rotation.x += delta * 0.15;
  });

  // Visible primarily during ABOUT and EVENTS sections (scrollProgress ~0.15 to 0.45)
  const isVisible = scrollProgress > 0.1 && scrollProgress < 0.55;
  const opacity = isVisible ? THREE.MathUtils.clamp((scrollProgress - 0.1) * 6, 0, 1) : 0;

  if (opacity <= 0.01) return null;

  return (
    <group
      ref={meshGroup}
      position={[-2.8, -0.4, -4]}
      scale={0.85}
    >
      {/* Three crossed extruded bars forming the iconic lime asterisk '*' */}
      {[0, Math.PI / 3, (2 * Math.PI) / 3].map((angle, i) => (
        <mesh key={i} rotation={[0, 0, angle]}>
          <boxGeometry args={[3.2, 0.45, 0.45]} />
          <meshStandardMaterial
            color="#D4FF00"
            emissive="#D4FF00"
            emissiveIntensity={0.65}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}

      {/* Center core beacon light */}
      <mesh>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshBasicMaterial
          color="#FFF1D0"
          transparent
          opacity={opacity * 0.9}
        />
      </mesh>
    </group>
  );
};
