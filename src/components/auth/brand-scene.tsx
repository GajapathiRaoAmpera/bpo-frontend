"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import styles from "./brand-scene.module.scss";

// Ampera brand tones (src/styles/_tokens.scss), picked for contrast against --color-primary.
const SHAPES = [
  { position: [-2.6, 1.3, -1] as const, scale: 0.85, color: "#e0b9df", speed: 0.18 },
  { position: [2.7, -0.9, -2] as const, scale: 1.2, color: "#a89bcf", speed: 0.12 },
  { position: [1.5, 1.9, -1.6] as const, scale: 0.55, color: "#f7edf7", speed: 0.24 },
  { position: [-1.9, -1.7, -0.5] as const, scale: 0.7, color: "#dfc0df", speed: 0.15 },
  { position: [0.3, 0.3, -3] as const, scale: 1.5, color: "#7e2b7c", speed: 0.1 },
  { position: [3.3, 1.5, -2.5] as const, scale: 0.45, color: "#e0b9df", speed: 0.2 },
];

function FloatingShape({
  position,
  scale,
  color,
  speed,
  still,
}: {
  position: readonly [number, number, number];
  scale: number;
  color: string;
  speed: number;
  still: boolean;
}) {
  const ref = useRef<Mesh>(null);
  const baseY = position[1];

  useFrame((state, delta) => {
    if (still || !ref.current) return;
    ref.current.rotation.x += delta * speed * 0.4;
    ref.current.rotation.y += delta * speed;
    ref.current.position.y = baseY + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.3;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

// Decorative only: aria-hidden, no pointer events, frozen under prefers-reduced-motion.
export function BrandScene() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className={styles.root} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={reduced ? "demand" : "always"}
        camera={{ position: [0, 0, 6], fov: 45 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 2]} intensity={1.1} />
        {SHAPES.map((shape, i) => (
          <FloatingShape key={i} {...shape} still={reduced} />
        ))}
      </Canvas>
    </div>
  );
}
