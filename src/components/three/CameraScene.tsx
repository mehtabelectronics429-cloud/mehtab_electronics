"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { clamp01, smoothstep, lerp, explodePhase, COLORS } from "@/lib/three-utils";
import { CAMERA_PART_IMAGES, CAMERA_IMAGE } from "@/lib/data";
import SceneEffects from "./Effects";
import Dust from "./Dust";
import ImagePlane from "./ImagePlane";

/**
 * The camera BREAKS APART (body shell splits, glass explodes forward) while the
 * scene flies INSIDE the barrel, passing each real inner part in place. Parts
 * are borderless photos that brighten (bloom) when active. Reassembles at end.
 */

const STEEL = "#8a94a6";

// Exploding shell pieces: two body halves + rear cap.
const PANELS: { pos: [number, number, number]; kind: "left" | "right" | "cap"; dir: [number, number, number]; off: number }[] = [
  { pos: [0, 0, -0.15], kind: "left", dir: [-1, 0.15, 0], off: 1.9 },
  { pos: [0, 0, -0.15], kind: "right", dir: [1, 0.15, 0], off: 1.9 },
  { pos: [0, 0, -1.15], kind: "cap", dir: [0, 0, -1], off: 1.9 },
];

// Inner parts front→back (index-matched to CAMERA_PARTS).
const POS: [number, number, number][] = [
  [0.0, 0.0, 0.72], [0.0, 0.0, 0.45], [0.0, 0.42, 0.55], [0.4, 0.2, 0.3], [-0.4, 0.2, 0.15],
  [0.38, -0.3, 0.0], [-0.38, -0.3, -0.15], [0.0, 0.42, -0.3], [0.0, -0.42, -0.45], [0.0, 0.0, -0.62],
];
const FRONT_IN = 0.7;
const BACK_Z = -0.78;

function Rig({ progress, panels, parts, cover }: {
  progress: MotionValue<number>;
  panels: React.MutableRefObject<(THREE.Mesh | null)[]>;
  parts: React.MutableRefObject<(THREE.Group | null)[]>;
  cover: React.MutableRefObject<THREE.Group | null>;
}) {
  const { camera, pointer } = useThree();
  const camPos = useRef(new THREE.Vector3(0, 0.3, 8));
  const look = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = clamp01(progress.get());
    const { phase, index } = explodePhase(p, POS.length);

    const e = clamp01(smoothstep(0.16, 0.4, p) - smoothstep(0.88, 0.98, p));
    const inside = clamp01(smoothstep(0.34, 0.5, p) - smoothstep(0.88, 0.98, p));
    const reveal = clamp01(smoothstep(0.34, 0.46, p) - smoothstep(0.9, 0.98, p));
    const panelOp = clamp01(1 - 0.55 * inside);

    panels.current.forEach((m, i) => {
      if (!m) return;
      const d = PANELS[i];
      m.position.set(d.pos[0] + d.dir[0] * e * d.off, d.pos[1] + d.dir[1] * e * d.off, d.pos[2] + d.dir[2] * e * d.off);
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = panelOp;
      m.visible = panelOp > 0.03;
    });

    if (cover.current) {
      cover.current.position.z = 0.95 + e * 2.8;
      cover.current.visible = (1 - 0.8 * inside) > 0.04;
      cover.current.traverse((o) => {
        const m = (o as THREE.Mesh).material as (THREE.MeshBasicMaterial | THREE.MeshStandardMaterial) | undefined;
        if (m && "opacity" in m) m.opacity = clamp01(1 - 0.8 * inside) * ((m as THREE.MeshStandardMaterial).name === "glass" ? 0.5 : 1);
      });
    }

    parts.current.forEach((g, i) => {
      if (!g) return;
      const activeP = phase === "component" && index === i;
      g.visible = reveal > 0.02;
      g.scale.setScalar(lerp(g.scale.x, reveal * (activeP ? 1.3 : 1), 0.12));
      g.position.y = POS[i][1] + Math.sin(t * 1.1 + i) * 0.015;
      g.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
        if (m && (m as THREE.Material).type === "MeshBasicMaterial") {
          const target = activeP ? 1.9 : reveal > 0.05 ? 1 : 0.4;
          m.color.setScalar(lerp(m.color.r, target, 0.12));
        }
      });
    });

    let cz: number, cx = pointer.x * 0.35, cy = 0.25 + pointer.y * 0.3;
    let lx = 0, ly = 0, lz = 0;
    if (phase === "component") {
      const comp = clamp01((p - 0.48) / (0.86 - 0.48));
      cz = lerp(FRONT_IN, BACK_Z, comp) + 0.85;
      const part = POS[index];
      cx = part[0] * 0.5 + pointer.x * 0.25;
      cy = part[1] * 0.5 + 0.05 + pointer.y * 0.25;
      lx = part[0]; ly = part[1]; lz = part[2];
    } else {
      cz = 8 - 4.5 * smoothstep(0.12, 0.22, p) - 1.8 * smoothstep(0.22, 0.35, p) - 1.05 * smoothstep(0.35, 0.48, p) + 7.2 * smoothstep(0.86, 1, p);
    }
    cx += Math.sin(t * 1.2) * 0.02;
    cy += Math.cos(t * 1.0) * 0.02;

    camPos.current.set(cx, cy, cz);
    camera.position.lerp(camPos.current, 0.06);
    look.current.lerp(new THREE.Vector3(lx, ly, lz), 0.08);
    camera.lookAt(look.current);
  });

  return null;
}

function ShellGeoMat({ kind }: { kind: "left" | "right" | "cap" }) {
  if (kind === "cap") return (<><cylinderGeometry args={[0.64, 0.64, 0.1, 48]} /><meshStandardMaterial color="#0c0f16" metalness={0.7} roughness={0.5} transparent /></>);
  const start = kind === "left" ? Math.PI * 0.5 : Math.PI * 1.5;
  return (<><cylinderGeometry args={[0.64, 0.64, 2.0, 40, 1, true, start, Math.PI]} /><meshStandardMaterial color="#0b0e14" metalness={0.8} roughness={0.35} transparent side={THREE.DoubleSide} /></>);
}

export default function CameraScene({ progress }: { progress: MotionValue<number> }) {
  const panels = useRef<(THREE.Mesh | null)[]>([]);
  const parts = useRef<(THREE.Group | null)[]>([]);
  const cover = useRef<THREE.Group | null>(null);

  return (
    <Canvas dpr={[1, 1.8]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} camera={{ position: [0, 0.3, 8], fov: 46 }} className="!absolute inset-0">
      <fog attach="fog" args={["#04060B", 9, 24]} />
      <ambientLight intensity={0.6} />
      <spotLight position={[5, 8, 6]} angle={0.5} penumbra={1} intensity={90} color="#dbe9ff" />
      <pointLight position={[0, 0.4, 1.5]} intensity={30} color={COLORS.cyan} distance={12} />
      <pointLight position={[0, 0, -0.5]} intensity={22} color={COLORS.electric} distance={10} />

      <Rig progress={progress} panels={panels} parts={parts} cover={cover} />

      <group>
        {PANELS.map((pl, i) => (
          <mesh key={i} ref={(el) => { panels.current[i] = el; }} position={pl.pos} rotation={[Math.PI / 2, 0, 0]}>
            <ShellGeoMat kind={pl.kind} />
          </mesh>
        ))}

        {/* front glass + bezel carrying the real product photo (borderless) */}
        <group ref={cover} position={[0, 0, 0.95]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[0.55, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial name="glass" color="#6fe4ff" emissive={COLORS.cyan} emissiveIntensity={0.3} metalness={0.1} roughness={0.05} transparent opacity={0.5} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.06, 16, 40]} />
            <meshStandardMaterial color={STEEL} metalness={0.95} roughness={0.2} transparent />
          </mesh>
          <group position={[0, 0, 0.14]}>
            <ImagePlane url={CAMERA_IMAGE} w={0.72} h={0.72} />
          </group>
        </group>

        {POS.map((pos, i) => (
          <group key={i} ref={(el) => { parts.current[i] = el; }} position={pos} scale={0.001} visible={false}>
            <ImagePlane url={CAMERA_PART_IMAGES[i]} w={0.54} h={0.42} />
          </group>
        ))}
      </group>

      <Dust count={260} color={COLORS.cyan} radius={14} />
      <SceneEffects bloomIntensity={1.1} threshold={0.22} />
    </Canvas>
  );
}
