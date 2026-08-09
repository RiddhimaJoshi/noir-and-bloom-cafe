import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Bean({ basePosition, scale = 1, speed = 1, floatAmp = 0.4 }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * 0.3 * speed;
    ref.current.rotation.y = t * 0.4 * speed;
    ref.current.position.y = basePosition[1] + Math.sin(t * speed + basePosition[0]) * floatAmp;
    ref.current.position.x = basePosition[0] + Math.cos(t * speed * 0.5) * 0.15;
  });
  return (
    <mesh ref={ref} position={basePosition} scale={scale}>
      <sphereGeometry args={[0.55, 32, 32]} />
      <meshStandardMaterial color="#3d1f10" roughness={0.35} metalness={0.15} />
    </mesh>
  );
}

function Particles({ count = 80 }) {
  const points = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);
  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.05;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#D4AF37" size={0.035} sizeAttenuation transparent opacity={0.65} />
    </points>
  );
}

export default function HeroCanvas() {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return null;

  const beans = [
    { basePosition: [-3.5, 1.2, -1], scale: 0.9, speed: 0.7 },
    { basePosition: [3.2, -0.8, -2], scale: 1.1, speed: 0.5 },
    { basePosition: [-1.8, -1.5, 0], scale: 0.7, speed: 0.9 },
    { basePosition: [2.5, 1.8, -1.5], scale: 0.8, speed: 0.6 },
    { basePosition: [0, 0.5, -3], scale: 1.2, speed: 0.4 },
    { basePosition: [-4, -0.2, -0.5], scale: 0.6, speed: 1.0 },
  ];

  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 4, 4]} intensity={30} color="#D4AF37" />
      <pointLight position={[-6, -2, 3]} intensity={15} color="#8C3B20" />
      <Suspense fallback={null}>
        {beans.map((b, i) => <Bean key={i} {...b} />)}
        <Particles count={80} />
      </Suspense>
    </Canvas>
  );
}
