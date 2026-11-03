"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, CanvasTexture, MathUtils } from "three";
import type { Group, Points, Sprite } from "three";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { pointerInCanvas, windowPointer, useWindowPointer } from "@/hooks/use-window-pointer";

import styles from "./pointer-field.module.scss";

const COLS = 34;
const ROWS = 26;
const GAP = 0.4;

// Dot grid that tilts toward the mouse; dots under the cursor lift in a soft ripple.
export function DotGrid({ still, color = "#9c369a", opacity = 0.45, z = 0 }: { still: boolean; color?: string; opacity?: number; z?: number }) {
  const group = useRef<Group>(null);
  const points = useRef<Points>(null);
  const target = useRef<[number, number]>([99, 99]);

  const positions = useMemo(() => {
    const p = new Float32Array(COLS * ROWS * 3);
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const i = (r * COLS + c) * 3;
        p[i] = (c - (COLS - 1) / 2) * GAP;
        p[i + 1] = (r - (ROWS - 1) / 2) * GAP;
      }
    return p;
  }, []);
  const live = useMemo(() => positions.slice(), [positions]);

  useFrame((state, delta) => {
    if (still || !group.current || !points.current) return;
    const hit = pointerInCanvas(state.gl.domElement, state.viewport.width, state.viewport.height);
    const [tx, ty] = target.current;
    target.current = hit
      ? [MathUtils.damp(tx, hit[0], 8, delta), MathUtils.damp(ty, hit[1], 8, delta)]
      : [tx, ty];
    const strength = hit ? 1 : 0;

    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, -windowPointer.y * 0.18, 3, delta);
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, windowPointer.x * 0.18, 3, delta);

    const attr = points.current.geometry.getAttribute("position") as BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < attr.count; i++) {
      const x = positions[i * 3]!;
      const y = positions[i * 3 + 1]!;
      const d2 = (x - target.current[0]) ** 2 + (y - target.current[1]) ** 2;
      const lift = strength * 2.2 * Math.exp(-d2 / 1.8);
      const idle = 0.06 * Math.sin(t * 0.8 + x * 0.6 + y * 0.4);
      attr.setZ(i, MathUtils.damp(attr.getZ(i), lift + idle, 6, delta));
    }
    attr.needsUpdate = true;
  });

  return (
    <group ref={group} position-z={z}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[live, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.05} transparent opacity={opacity} depthWrite={false} />
      </points>
    </group>
  );
}

const ORBS = [
  { x: -2.4, y: 1.4, size: 6, color: "#e0b9df", depth: 0.9, speed: 0.22 },
  { x: 2.2, y: -1.6, size: 7, color: "#a89bcf", depth: 0.6, speed: 0.17 },
  { x: 0.6, y: 2.6, size: 4.5, color: "#9c369a", depth: 1.3, speed: 0.28 },
];

// Soft glows the glass card blurs; each drifts on its own and leans with the mouse at its own depth.
function Orbs({ still }: { still: boolean }) {
  const sprites = useRef<(Sprite | null)[]>([]);
  const glow = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new CanvasTexture(c);
  }, []);

  useFrame((state, delta) => {
    const t = still ? 0 : state.clock.elapsedTime;
    sprites.current.forEach((s, i) => {
      const o = ORBS[i]!;
      if (!s) return;
      const px = still ? 0 : windowPointer.x * o.depth;
      const py = still ? 0 : windowPointer.y * o.depth;
      s.position.x = MathUtils.damp(s.position.x, o.x + Math.sin(t * o.speed + i) * 0.8 + px, 2, delta);
      s.position.y = MathUtils.damp(s.position.y, o.y + Math.cos(t * o.speed * 1.3 + i) * 0.6 + py, 2, delta);
    });
  });

  return (
    <>
      {ORBS.map((o, i) => (
        <sprite key={o.color} ref={(el) => void (sprites.current[i] = el)} position={[o.x, o.y, -2]} scale={o.size}>
          <spriteMaterial map={glow} color={o.color} transparent opacity={0.65} depthWrite={false} />
        </sprite>
      ))}
    </>
  );
}

// Decorative only: aria-hidden, no pointer events; static under prefers-reduced-motion.
export function PointerField() {
  const reduced = usePrefersReducedMotion();
  useWindowPointer(!reduced);

  return (
    <div className={styles.root} aria-hidden="true">
      <Canvas dpr={[1, 1.5]} frameloop={reduced ? "demand" : "always"} camera={{ position: [0, 0, 9], fov: 50 }}>
        <Orbs still={reduced} />
        <DotGrid still={reduced} />
      </Canvas>
    </div>
  );
}
