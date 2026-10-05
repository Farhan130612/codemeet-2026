import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarfieldProps {
  count?: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}

export const Starfield: React.FC<StarfieldProps> = ({ count = 1800, mouse }) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate 3 layers of stars with depth and color variation (white, lime glints, warm starlight)
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorWhite = new THREE.Color('#FFFFFF');
    const colorLime = new THREE.Color('#D4FF00');
    const colorWarm = new THREE.Color('#FFF1D0');

    for (let i = 0; i < count; i++) {
      // Distribute stars in a wide spherical shell
      const r = THREE.MathUtils.randFloat(25, 90);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi) - 10;

      // Color choice: 80% white, 12% lime tint, 8% warm starlight
      const rand = Math.random();
      let chosenColor = colorWhite;
      if (rand < 0.12) {
        chosenColor = colorLime;
      } else if (rand < 0.20) {
        chosenColor = colorWarm;
      }

      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    // Slow rotational drift
    pointsRef.current.rotation.y += delta * 0.02;
    pointsRef.current.rotation.x += delta * 0.008;

    // Subtle parallax response to mouse
    pointsRef.current.position.x = THREE.MathUtils.lerp(
      pointsRef.current.position.x,
      mouse.current.x * 1.5,
      delta * 2
    );
    pointsRef.current.position.y = THREE.MathUtils.lerp(
      pointsRef.current.position.y,
      mouse.current.y * 1.5,
      delta * 2
    );
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.1}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
