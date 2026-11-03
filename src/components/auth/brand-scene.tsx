"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DoubleSide, MathUtils } from "three";
import type { Group, Mesh, MeshBasicMaterial } from "three";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import styles from "./brand-scene.module.scss";

// The login panel's whole pitch is one call told as a story, one beat at a time.
const STAGES = [
  "Customer call connects",
  "AI agent answers in seconds",
  "Identity and compliance verified",
  "A human agent can take over anytime",
  "English, Tamil and Hindi",
] as const;
const STAGE_MS = 2600;

const LIGHT = "#f7edf7";
const ACCENT = "#e0b9df";
const MUTED = "#a89bcf";

// Eases a beat in (grow + unspin + rise) and out; reduced motion snaps instead.
function Stage({ active, still, children }: { active: boolean; still: boolean; children: ReactNode }) {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const target = active ? 1 : 0;
    const w = still ? target : MathUtils.damp(g.scale.x, target, active ? 5 : 7, delta);
    g.scale.setScalar(w);
    g.rotation.y = (1 - w) * (active ? -0.9 : 0.9);
    g.position.y = (1 - w) * (active ? -0.6 : 0.6);
    g.visible = w > 0.01;
  });

  return (
    <group ref={ref} scale={still && active ? 1 : 0}>
      {children}
    </group>
  );
}

const RING_COUNT = 3;

function CallRinging({ still }: { still: boolean }) {
  const rings = useRef<(Mesh | null)[]>([]);
  const handset = useRef<Group>(null);
  const cycle = 1.6;

  useFrame((state) => {
    const t = still ? 0 : state.clock.elapsedTime;
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = ((t + (i * cycle) / RING_COUNT) % cycle) / cycle;
      ring.scale.setScalar(0.6 + MathUtils.smootherstep(phase, 0, 1) * 1.6);
      (ring.material as MeshBasicMaterial).opacity = still ? 0.4 : 0.7 * (1 - phase);
    });
    // Handset buzzes in short bursts, like a phone ringing.
    if (handset.current) handset.current.rotation.z = 0.5 + Math.sin(t * 40) * 0.08 * Math.max(0, Math.sin(t * 4));
  });

  return (
    <>
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <mesh key={i} ref={(el) => void (rings.current[i] = el)}>
          <ringGeometry args={[0.9, 0.96, 48]} />
          <meshBasicMaterial color={ACCENT} transparent side={DoubleSide} />
        </mesh>
      ))}
      <group ref={handset}>
        <mesh position={[-0.42, 0.42, 0]}>
          <capsuleGeometry args={[0.16, 0.22, 4, 12]} />
          <meshBasicMaterial color={LIGHT} />
        </mesh>
        <mesh position={[0.42, -0.42, 0]}>
          <capsuleGeometry args={[0.16, 0.22, 4, 12]} />
          <meshBasicMaterial color={LIGHT} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.18, 1.1, 0.12]} />
          <meshBasicMaterial color={LIGHT} />
        </mesh>
      </group>
    </>
  );
}

function Headset({ color = LIGHT }: { color?: string }) {
  return (
    <>
      <mesh>
        <torusGeometry args={[0.75, 0.07, 10, 40, Math.PI]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {[-0.75, 0.75].map((x) => (
        <mesh key={x} position={[x, -0.1, 0]}>
          <capsuleGeometry args={[0.17, 0.25, 4, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[0.45, -0.55, 0]} rotation={[0, 0, -1]}>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}

function AiAgent({ still }: { still: boolean }) {
  const core = useRef<Mesh>(null);

  useFrame((state) => {
    const t = still ? 0 : state.clock.elapsedTime;
    if (core.current) core.current.rotation.set(t * 0.7, t * 0.9, 0);
  });

  return (
    <>
      <Headset />
      <mesh ref={core} position={[0, -0.15, 0]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshBasicMaterial color={ACCENT} wireframe />
      </mesh>
    </>
  );
}

function ComplianceCheck({ still }: { still: boolean }) {
  const gem = useRef<Mesh>(null);
  const scan = useRef<Mesh>(null);
  const tick = useRef<Group>(null);

  useFrame((state) => {
    const t = still ? 2 : state.clock.elapsedTime;
    if (gem.current) gem.current.rotation.y = t * 0.6;
    if (scan.current) scan.current.position.set(Math.cos(t * 1.8) * 1.25, Math.sin(t * 1.8) * 1.25, 0.3);
    // Tick draws in once per beat, after the scan has swept.
    if (tick.current) tick.current.scale.setScalar(MathUtils.smootherstep((t % (STAGE_MS / 1000)) / 1.2, 0.3, 1));
  });

  return (
    <>
      <mesh ref={gem} rotation={[0.4, 0, 0.2]}>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshBasicMaterial color={LIGHT} transparent opacity={0.6} wireframe />
      </mesh>
      <mesh ref={scan}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <group ref={tick} position={[0, 0, 1]}>
        <mesh position={[-0.2, -0.05, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.1, 0.4, 0.05]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.12, 0.12, 0]} rotation={[0, 0, -Math.PI / 5]}>
          <boxGeometry args={[0.1, 0.75, 0.05]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </>
  );
}

// Human agent steps in beside the AI headset and takes the call over.
function HumanTakeover({ still }: { still: boolean }) {
  const person = useRef<Group>(null);
  const ai = useRef<Group>(null);

  useFrame((state) => {
    const t = still ? 1.5 : (state.clock.elapsedTime % (STAGE_MS / 1000)) / 1.5;
    const k = MathUtils.smootherstep(t, 0, 1);
    if (person.current) person.current.position.x = MathUtils.lerp(1.8, 0.35, k);
    if (ai.current) {
      ai.current.position.x = MathUtils.lerp(0, -1.1, k);
      ai.current.scale.setScalar(MathUtils.lerp(1, 0.6, k));
    }
  });

  return (
    <>
      <group ref={ai}>
        <Headset color={MUTED} />
      </group>
      <group ref={person}>
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.38, 20, 20]} />
          <meshBasicMaterial color={LIGHT} />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <capsuleGeometry args={[0.55, 0.4, 6, 20]} />
          <meshBasicMaterial color={LIGHT} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <torusGeometry args={[0.5, 0.05, 8, 32, Math.PI]} />
          <meshBasicMaterial color={ACCENT} />
        </mesh>
      </group>
    </>
  );
}

function Multilingual({ still }: { still: boolean }) {
  const orbit = useRef<Group>(null);

  useFrame((state) => {
    if (orbit.current) orbit.current.rotation.z = still ? 0 : state.clock.elapsedTime * 0.8;
  });

  return (
    <>
      <mesh>
        <octahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <group ref={orbit}>
        {[LIGHT, ACCENT, MUTED].map((color, i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh key={color} position={[Math.cos(a) * 1.3, Math.sin(a) * 1.3, 0]}>
              <sphereGeometry args={[0.24, 14, 14]} />
              <meshBasicMaterial color={color} />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

const BAR_COUNT = 40;
const BAR_COLORS = [LIGHT, ACCENT, "#dfc0df", MUTED, "#ffffff"];

// The live call underneath every beat: calm while ringing, speaking once answered.
function Waveform({ speaking, still }: { speaking: boolean; still: boolean }) {
  const bars = useRef<(Mesh | null)[]>([]);
  const energy = useRef(0);

  useFrame((state, delta) => {
    const t = still ? 0 : state.clock.elapsedTime;
    energy.current = still ? 1 : MathUtils.damp(energy.current, speaking ? 1 : 0.15, 3, delta);
    bars.current.forEach((bar, i) => {
      if (!bar) return;
      const seed = i * 0.37;
      const voice = 0.5 + 0.5 * Math.sin(t * 2.2 + seed * 1.6) * Math.sin(t * 0.9 + seed);
      const h = 0.1 + energy.current * (0.3 + 0.55 * Math.abs(Math.sin(seed)) + 0.55 * voice);
      bar.scale.y = h;
      bar.position.y = -3.95 + h / 2;
    });
  });

  return (
    <>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <mesh key={i} ref={(el) => void (bars.current[i] = el)} position={[-2 + (i / (BAR_COUNT - 1)) * 4, -3.95, 0]}>
          <boxGeometry args={[0.07, 1, 0.07]} />
          <meshBasicMaterial color={BAR_COLORS[i % BAR_COLORS.length]} transparent opacity={0.7} />
        </mesh>
      ))}
    </>
  );
}

const BEATS = [CallRinging, AiAgent, ComplianceCheck, HumanTakeover, Multilingual];

// Decorative only: aria-hidden, no pointer events, frozen on beat one under prefers-reduced-motion.
export function BrandScene() {
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  const stage = reduced ? 0 : tick;

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((s) => (s + 1) % STAGES.length), STAGE_MS);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className={styles.root} aria-hidden="true">
      <Canvas dpr={[1, 1.5]} frameloop={reduced ? "demand" : "always"} camera={{ position: [0, 0, 9], fov: 50 }}>
        <group position={[0, 0.9, 0]} scale={1.3}>
          {BEATS.map((Beat, i) => (
            <Stage key={i} active={i === stage} still={reduced}>
              <Beat still={reduced} />
            </Stage>
          ))}
        </group>
        <Waveform speaking={stage !== 0} still={reduced} />
      </Canvas>
      <div className={styles.caption}>
        <span className={styles.step}>
          {String(stage + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
        </span>
        <p key={stage} className={styles.text}>
          {STAGES[stage]}
        </p>
        <div className={styles.dots}>
          {STAGES.map((label, i) => (
            <span key={label} className={i === stage ? styles.dotActive : styles.dot} />
          ))}
        </div>
      </div>
    </div>
  );
}
