import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GridFloorProps {
  scrollProgress: number;
}

export const GridFloor: React.FC<GridFloorProps> = ({ scrollProgress }) => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((_, delta) => {
    if (!gridRef.current) return;
    // Slow drift along Z axis giving motion feel
    gridRef.current.position.z = (gridRef.current.position.z + delta * 0.8) % 2;
  });

  // Fade out as camera travels deep into space
  const opacity = Math.max(0, 1 - scrollProgress * 2.5);
  if (opacity <= 0.01) return null;

  return (
    <group position={[0, -2.6, 0]} rotation={[0, 0, 0]}>
      <gridHelper
        ref={gridRef}
        args={[40, 40, '#D4FF00', 'rgba(212, 255, 0, 0.12)']}
        position={[0, 0, 0]}
      />
    </group>
  );
};
