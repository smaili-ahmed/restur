import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { webglAvailable, GLBoundary } from './safe';

function Particles({ count = 220, color = '#00e5ff' }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.02;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.05) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={color} transparent opacity={0.5} depthWrite={false} />
    </points>
  );
}

function StaticField({ color1 = 'rgba(0,229,255,0.25)', color2 = 'rgba(124,77,255,0.22)' }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(${color1} 1px, transparent 1px), radial-gradient(${color2} 1px, transparent 1px)`,
        backgroundSize: '140px 140px, 90px 90px',
        backgroundPosition: '0 0, 45px 45px',
        opacity: 0.35,
      }}
    />
  );
}

export function ParticleField({ count = 220, color = '#00e5ff', color1, color2 }) {
  if (!webglAvailable()) return <StaticField color1={color1} color2={color2} />;
  return (
    <GLBoundary fallback={<StaticField color1={color1} color2={color2} />}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        <Particles count={count} color={color} />
      </Canvas>
    </GLBoundary>
  );
}
