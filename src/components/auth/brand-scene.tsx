"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AdditiveBlending, CatmullRomCurve3, Color, DoubleSide, MathUtils, Object3D, Vector3 } from "three";
import type { Group, InstancedMesh, Mesh, MeshBasicMaterial, TubeGeometry } from "three";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { windowPointer, useWindowPointer } from "@/hooks/use-window-pointer";

import styles from "./brand-scene.module.scss";
import { DotGrid } from "./pointer-field";

// The login panel's whole pitch is one call told as a story, one beat at a time.
const STAGES = [
  "Customer call connects",
  "AI agent answers in seconds",
  "Identity and compliance verified",
  "A human agent can take over anytime",
  "English, Hindi, Tamil, Telugu, Kannada, Malayalam",
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

const ARC = [0, 0.2, -0.12, 0.18, 0]; // gentle signal-path curve through the five stops
const TRACK = new CatmullRomCurve3(STAGES.map((_, i) => new Vector3(-2 + i, -3.35 + ARC[i]!, 0)));
// getPoint(t) is per-control-point uniform, so t = i/(n-1) lands exactly on stop i.
const nodeT = (i: number) => i / (STAGES.length - 1);
const SEGMENTS = 160;
const RADIAL = 8;
const PARTICLES = 36;
const TRAIL = 8;
const BURST_S = 0.8;
const C_LIGHT = new Color(LIGHT);
const C_MUTED = new Color(MUTED);
const dummy = new Object3D();
const at = new Vector3();

// The call's journey under every beat: data streams along a curved signal path, a glowing marker
// with a comet tail glides to the current stop, and each stop flashes as it is reached.
function JourneyTrack({ stage, still }: { stage: number; still: boolean }) {
  const progress = useRef(nodeT(stage));
  const trailT = useRef<number[]>(Array(TRAIL).fill(nodeT(stage)));
  const burst = useRef({ stage, start: -BURST_S });
  const fill = useRef<TubeGeometry>(null);
  const marker = useRef<Group>(null);
  const pings = useRef<(Mesh | null)[]>([]);
  const trail = useRef<(Mesh | null)[]>([]);
  const flow = useRef<InstancedMesh>(null);
  const burstRing = useRef<Mesh>(null);
  const cores = useRef<(Mesh | null)[]>([]);
  const rings = useRef<(Mesh | null)[]>([]);

  useLayoutEffect(() => {
    const m = flow.current;
    if (!m) return;
    for (let j = 0; j < PARTICLES; j++) m.setColorAt(j, C_MUTED);
    m.instanceColor!.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    const time = still ? 0 : state.clock.elapsedTime;
    const target = nodeT(stage);
    if (stage === 0 && progress.current > 0.5) progress.current = 0; // new call: restart, don't sweep back
    const t = (progress.current = still ? target : MathUtils.damp(progress.current, target, 3, delta));

    fill.current?.setDrawRange(0, Math.floor(t * SEGMENTS) * RADIAL * 6);
    TRACK.getPoint(t, at);
    marker.current?.position.copy(at);

    pings.current.forEach((ping, k) => {
      if (!ping) return;
      const ph = still ? 0.4 : (time * 0.7 + k * 0.5) % 1;
      ping.scale.setScalar(1 + ph * 2.4);
      (ping.material as MeshBasicMaterial).opacity = 0.5 * (1 - ph);
    });

    trail.current.forEach((dot, k) => {
      const prev = k === 0 ? t : trailT.current[k - 1]!;
      trailT.current[k] = still ? t : MathUtils.damp(trailT.current[k]!, prev, 16, delta);
      if (!dot) return;
      TRACK.getPoint(trailT.current[k]!, dot.position);
      dot.scale.setScalar(1 - (k + 1) / (TRAIL + 1));
    });

    const m = flow.current;
    if (m) {
      for (let j = 0; j < PARTICLES; j++) {
        const u = (j / PARTICLES + time * 0.05) % 1;
        TRACK.getPoint(u, dummy.position);
        dummy.position.y += Math.sin(time * 3 + j * 1.7) * 0.035;
        const behind = u <= t;
        dummy.scale.setScalar(behind ? 0.03 : 0.018);
        dummy.updateMatrix();
        m.setMatrixAt(j, dummy.matrix);
        m.setColorAt(j, behind ? C_LIGHT : C_MUTED);
      }
      m.instanceMatrix.needsUpdate = true;
      m.instanceColor!.needsUpdate = true;
    }

    if (burst.current.stage !== stage) burst.current = { stage, start: state.clock.elapsedTime };
    const ring = burstRing.current;
    if (ring) {
      const age = state.clock.elapsedTime - burst.current.start;
      ring.visible = !still && age < BURST_S;
      TRACK.getPoint(target, ring.position);
      ring.scale.setScalar(1 + (age / BURST_S) * 4);
      (ring.material as MeshBasicMaterial).opacity = 0.8 * (1 - age / BURST_S);
    }

    STAGES.forEach((_, i) => {
      const reached = i <= stage;
      const s = i === stage ? 1.35 : 1;
      const r = rings.current[i];
      if (r) {
        r.scale.setScalar(still ? s : MathUtils.damp(r.scale.x, s, 6, delta));
        (r.material as MeshBasicMaterial).color.set(reached ? LIGHT : MUTED);
      }
      const c = cores.current[i];
      if (c) c.scale.setScalar(still ? (reached ? 1 : 0) : MathUtils.damp(c.scale.x, reached ? 1 : 0, 8, delta));
    });
  });

  return (
    <>
      <mesh>
        <tubeGeometry args={[TRACK, SEGMENTS, 0.012, RADIAL, false]} />
        <meshBasicMaterial color={MUTED} transparent opacity={0.4} />
      </mesh>
      <mesh>
        <tubeGeometry ref={fill} args={[TRACK, SEGMENTS, 0.02, RADIAL, false]} />
        <meshBasicMaterial color={ACCENT} />
      </mesh>
      <instancedMesh ref={flow} args={[undefined, undefined, PARTICLES]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial transparent opacity={0.9} />
      </instancedMesh>
      {STAGES.map((label, i) => {
        TRACK.getPoint(nodeT(i), at);
        return (
          <group key={label} position={[at.x, at.y, 0.01]}>
            <mesh ref={(el) => void (rings.current[i] = el)}>
              <ringGeometry args={[0.085, 0.11, 32]} />
              <meshBasicMaterial color={MUTED} />
            </mesh>
            <mesh ref={(el) => void (cores.current[i] = el)} scale={0}>
              <circleGeometry args={[0.06, 24]} />
              <meshBasicMaterial color={LIGHT} />
            </mesh>
          </group>
        );
      })}
      <mesh ref={burstRing} visible={false}>
        <ringGeometry args={[0.1, 0.13, 40]} />
        <meshBasicMaterial color="#ffffff" transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      {Array.from({ length: TRAIL }, (_, k) => (
        <mesh key={k} ref={(el) => void (trail.current[k] = el)}>
          <circleGeometry args={[0.1, 20]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.5 * (1 - k / TRAIL)} depthWrite={false} />
        </mesh>
      ))}
      <group ref={marker}>
        <mesh position-z={0.02}>
          <circleGeometry args={[0.32, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.18} depthWrite={false} blending={AdditiveBlending} />
        </mesh>
        {[0, 1].map((k) => (
          <mesh key={k} ref={(el) => void (pings.current[k] = el)} position-z={0.03}>
            <ringGeometry args={[0.15, 0.18, 40]} />
            <meshBasicMaterial color="#ffffff" transparent depthWrite={false} />
          </mesh>
        ))}
        <mesh position-z={0.04}>
          <circleGeometry args={[0.13, 32]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </>
  );
}

// Tilts the story toward the mouse and lets the camera drift with it, for a sense of depth.
function Parallax({ still, children }: { still: boolean; children: ReactNode }) {
  const ref = useRef<Group>(null);

  useFrame((state, delta) => {
    const g = ref.current;
    if (still || !g) return;
    g.rotation.y = MathUtils.damp(g.rotation.y, windowPointer.x * 0.35, 3, delta);
    g.rotation.x = MathUtils.damp(g.rotation.x, -windowPointer.y * 0.25, 3, delta);
    state.camera.position.x = MathUtils.damp(state.camera.position.x, windowPointer.x * 0.6, 2, delta);
    state.camera.position.y = MathUtils.damp(state.camera.position.y, windowPointer.y * 0.4, 2, delta);
    state.camera.lookAt(0, 0, 0);
  });

  return <group ref={ref}>{children}</group>;
}

const BEATS = [CallRinging, AiAgent, ComplianceCheck, HumanTakeover, Multilingual];

// Decorative only: aria-hidden, no pointer events, frozen on beat one under prefers-reduced-motion.
export function BrandScene() {
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  const stage = reduced ? 0 : tick;
  useWindowPointer(!reduced);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((s) => (s + 1) % STAGES.length), STAGE_MS);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className={styles.root} aria-hidden="true">
      <Canvas dpr={[1, 1.5]} frameloop={reduced ? "demand" : "always"} camera={{ position: [0, 0, 9], fov: 50 }}>
        <DotGrid still={reduced} color={LIGHT} opacity={0.3} z={-1.5} />
        <group position={[0, 1.2, 0]} scale={1.3}>
          <Parallax still={reduced}>
            {BEATS.map((Beat, i) => (
              <Stage key={i} active={i === stage} still={reduced}>
                <Beat still={reduced} />
              </Stage>
            ))}
          </Parallax>
        </group>
        <JourneyTrack stage={stage} still={reduced} />
      </Canvas>
      <div className={styles.caption}>
        <span className={styles.step}>
          {String(stage + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
        </span>
        <p key={stage} className={styles.text}>
          {STAGES[stage]}
        </p>
      </div>
    </div>
  );
}
