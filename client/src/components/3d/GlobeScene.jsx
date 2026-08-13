import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { webglAvailable, GLBoundary } from './safe';

const RADIUS = 2.1;

const PALETTES = {
  cyber: {
    primary: '#00e5ff',
    secondary: '#7c4dff',
    accent: '#00ffc8',
    nodeAlt: '#ffb020',
    globe: '#0b1526',
    emissive: '#0a1a3a',
    ring: '#7c4dff',
    dot: '#00e5ff',
    fallbackA: 'rgba(0,229,255,0.15)',
    fallbackB: 'rgba(124,77,255,0.15)',
  },
  gold: {
    primary: '#e3b04b',
    secondary: '#8a6d3b',
    accent: '#f0c87a',
    nodeAlt: '#ff8a3d',
    globe: '#1d130a',
    emissive: '#3a2710',
    ring: '#8a6d3b',
    dot: '#e3b04b',
    fallbackA: 'rgba(227,176,75,0.16)',
    fallbackB: 'rgba(138,109,59,0.16)',
  },
};

function GlobeFallback({ p }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        background:
          `radial-gradient(circle at 30% 30%, ${p.fallbackA}, transparent 60%), radial-gradient(circle at 70% 70%, ${p.fallbackB}, transparent 60%), #0a0704`,
        border: '1px solid var(--border)',
        borderRadius: '50%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          border: `2px solid ${p.primary}66`,
          boxShadow: `0 0 60px ${p.primary}40, inset 0 0 60px ${p.primary}26`,
          animation: 'floatSlow 6s ease-in-out infinite',
        }}
      />
      <span className="mono" style={{ position: 'absolute', color: 'var(--text-3)', fontSize: 12, letterSpacing: '0.2em' }}>
        ◉ CONNEXIONS TRACEES
      </span>
      <style>{`@keyframes floatSlow { 0%,100% { transform: scale(1); opacity: .9 } 50% { transform: scale(1.08); opacity: 1 } }`}</style>
    </div>
  );
}

function globePoint(lat, lon, r = RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

const NODES = [
  { lat: 48.8, lon: 2.3 },
  { lat: 40.7, lon: -74.0 },
  { lat: 35.6, lon: 139.6 },
  { lat: -33.8, lon: 151.2 },
  { lat: 51.5, lon: -0.12 },
  { lat: 1.35, lon: 103.8 },
  { lat: 19.0, lon: 72.8 },
  { lat: -23.5, lon: -46.6 },
];

const PAIRS = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [0, 5],
  [3, 6],
  [1, 7],
  [2, 6],
];

function Arc({ start, end, p }) {
  const ref = useRef();
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const height = 0.6 + Math.random() * 0.5;
  mid.add(mid.clone().normalize().multiplyScalar(height));

  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(start, mid, end), [start, mid, end]);
  const points = useMemo(() => curve.getPoints(40), [curve]);

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.18) % 1;
    if (!ref.current) return;
    const pt = curve.getPoint(t);
    const q = curve.getPoint(Math.min(t + 0.05, 1));
    ref.current.position.copy(pt);
    ref.current.lookAt(q);
  });

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={p.primary} transparent opacity={0.35} />
      </line>
      <mesh ref={ref}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={p.accent} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Globe({ p }) {
  const group = useRef();
  const inner = useRef();

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.06;
    if (inner.current) inner.current.rotation.y -= delta * 0.1;
  });

  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: p.ring, transparent: true, opacity: 0.22 }),
    [p]
  );

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshStandardMaterial
          color={p.globe}
          roughness={0.55}
          metalness={0.3}
          emissive={p.emissive}
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[RADIUS + 0.02, 48, 48]} />
        <meshBasicMaterial color={p.primary} wireframe transparent opacity={0.12} />
      </mesh>

      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <ringGeometry args={[RADIUS + 0.35, RADIUS + 0.38, 90]} />
        <primitive object={ringMat} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 1.9, 0.4, 0]}>
        <ringGeometry args={[RADIUS + 0.55, RADIUS + 0.57, 90]} />
        <primitive object={ringMat} attach="material" />
      </mesh>

      {NODES.map((n, i) => {
        const pos = globePoint(n.lat, n.lon);
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshBasicMaterial color={i % 3 === 0 ? p.nodeAlt : p.dot} toneMapped={false} />
            <pointLight distance={2.5} intensity={1.4} color={i % 3 === 0 ? p.nodeAlt : p.dot} />
          </mesh>
        );
      })}

      {PAIRS.map(([a, b], i) => (
        <Arc
          key={i}
          start={globePoint(NODES[a].lat, NODES[a].lon)}
          end={globePoint(NODES[b].lat, NODES[b].lon)}
          p={p}
        />
      ))}

      <group ref={inner}>
        <mesh>
          <sphereGeometry args={[RADIUS + 0.04, 32, 32]} />
          <meshBasicMaterial color={p.primary} wireframe transparent opacity={0.06} />
        </mesh>
      </group>
    </group>
  );
}

function ScanRing({ p }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const y = ((clock.elapsedTime * 0.25) % 2) - 1;
    ref.current.position.y = y * RADIUS * 1.05;
    ref.current.rotation.x = Math.PI / 2;
  });
  return (
    <mesh ref={ref}>
      <ringGeometry args={[RADIUS * 0.96, RADIUS * 1.04, 64]} />
      <meshBasicMaterial color={p.accent} transparent opacity={0.55} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function GlobeScene({ showHud = false, tone = 'cyber' }) {
  const p = PALETTES[tone] || PALETTES.cyber;
  if (!webglAvailable()) return <GlobeFallback p={p} />;
  return (
    <GLBoundary fallback={<GlobeFallback p={p} />}>
      <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0.8, 6.2], fov: 48 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[6, 4, 6]} intensity={1.2} color={p.secondary} />
        <pointLight position={[-6, -2, -4]} intensity={0.8} color={p.primary} />
        <Suspense fallback={null}>
          <Globe p={p} />
          <ScanRing p={p} />
          <Stars radius={60} depth={40} count={2600} factor={3} saturation={0} fade speed={0.6} />
        </Suspense>
        {showHud && (
          <Html position={[0, 2.9, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="pill">◉ LIVE · CONNEXIONS TRACEES</div>
          </Html>
        )}
      </Canvas>
    </GLBoundary>
  );
}
