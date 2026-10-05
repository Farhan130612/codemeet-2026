import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const GLYPHS = ['0', '1', '</>', '{ }', '*', '=>', 'git', '0x1F'];

export const FloatingCodeGlyphs: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  const items = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      glyph: GLYPHS[i % GLYPHS.length],
      pos: [
        THREE.MathUtils.randFloat(-8, 8),
        THREE.MathUtils.randFloat(-5, 6),
        THREE.MathUtils.randFloat(-6, 2)
      ] as [number, number, number],
      rotSpeed: THREE.MathUtils.randFloat(-0.4, 0.4),
      floatSpeed: THREE.MathUtils.randFloat(0.3, 0.8),
      scale: THREE.MathUtils.randFloat(0.2, 0.45)
    }));
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    groupRef.current.children.forEach((child, idx) => {
      const item = items[idx];
      child.position.y += Math.sin(time * item.floatSpeed + idx) * delta * 0.2;
      child.rotation.z += item.rotSpeed * delta;
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((item, idx) => (
        <Text
          key={idx}
          position={item.pos}
          fontSize={item.scale}
          color="#D4FF00"
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_al061wqUwwwdpx.woff"
          fillOpacity={0.4}
        >
          {item.glyph}
        </Text>
      ))}
    </group>
  );
};
