"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS, lerp, clamp01 } from "@/lib/three-utils";

/* ─────────────────────────  SMART HOUSE  ───────────────────────── */
export function SmartHouse({ glowRef }: { glowRef: React.MutableRefObject<number> }) {
  const windows = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = glowRef.current;
    windows.current?.children.forEach((c) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = lerp(0.15, 3.2, g);
    });
  });

  const winPositions = useMemo(
    () => [
      [-0.9, 0.35, 1.51], [0.9, 0.35, 1.51], [0, -0.35, 1.51],
      [1.51, 0.2, 0.7], [1.51, 0.2, -0.7],
      [-1.51, 0.2, 0.7], [-1.51, 0.2, -0.7],
    ] as [number, number, number][],
    []
  );

  return (
    <group position={[0, 0, 0]}>
      {/* body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#0c1018" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* second storey */}
      <mesh castShadow position={[0.4, 1.4, -0.3]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#10151f" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* roof slab */}
      <mesh position={[0.4, 2, -0.3]}>
        <boxGeometry args={[2.3, 0.12, 2.3]} />
        <meshStandardMaterial color="#1B2130" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* edge trim glow */}
      <mesh position={[0, -1.02, 0]}>
        <boxGeometry args={[3.2, 0.06, 3.2]} />
        <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* windows */}
      <group ref={windows}>
        {winPositions.map((p, i) => (
          <mesh key={i} position={p} rotation={Math.abs(p[0]) > 1.4 ? [0, Math.PI / 2, 0] : [0, 0, 0]}>
            <planeGeometry args={[0.5, 0.5]} />
            <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0.15} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      {/* ground pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
        <circleGeometry args={[7, 64]} />
        <meshStandardMaterial color="#070a10" metalness={0.4} roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────  SECURITY CAMERAS  ───────────────────────── */
export function SecurityCameras({ revealRef, scanRef }: { revealRef: React.MutableRefObject<number>; scanRef: React.MutableRefObject<number> }) {
  const orbit = useRef<THREE.Group>(null);
  const cams = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  useFrame((state, delta) => {
    if (orbit.current) {
      orbit.current.rotation.y += delta * 0.25;
      const r = revealRef.current;
      orbit.current.scale.setScalar(lerp(0.001, 1, r));
      orbit.current.visible = r > 0.01;
    }
  });

  return (
    <group ref={orbit} position={[0, 1.3, 0]}>
      {cams.map((a, i) => {
        const x = Math.cos(a) * 3.6;
        const z = Math.sin(a) * 3.6;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -a + Math.PI / 2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.16, 0.16, 0.5, 16]} />
              <meshStandardMaterial color={COLORS.chrome} metalness={0.95} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.14, 0.18, 24]} />
              <meshStandardMaterial color="#05070c" metalness={1} roughness={0.05} />
            </mesh>
            <mesh position={[0, 0, 0.32]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={3} toneMapped={false} />
            </mesh>
            <ScanBeam origin={[x, 0, z]} scanRef={scanRef} />
          </group>
        );
      })}
    </group>
  );
}

function ScanBeam({ scanRef }: { origin: [number, number, number]; scanRef: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const s = scanRef.current;
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = s * (0.35 + 0.25 * Math.sin(state.clock.elapsedTime * 4));
    ref.current.visible = s > 0.02;
  });
  return (
    <mesh ref={ref} position={[0, -0.9, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.9, 2.6, 24, 1, true]} />
      <meshBasicMaterial color={COLORS.cyan} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* ─────────────────────────  SOLAR ARRAY  ───────────────────────── */
export function SolarArray({ riseRef }: { riseRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const panels = useMemo(() => {
    const arr: [number, number][] = [];
    for (let x = -1; x <= 1; x++) for (let z = 0; z <= 1; z++) arr.push([x * 1.25, z * 1.1]);
    return arr;
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const r = riseRef.current;
    group.current.position.y = lerp(-2.4, 0.02, r);
    group.current.visible = r > 0.01;
    group.current.children.forEach((c, i) => {
      c.rotation.x = lerp(0, -Math.PI / 5, r);
      const panel = (c as THREE.Group).children[0] as THREE.Mesh;
      if (panel) {
        const m = panel.material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = r * (0.4 + 0.5 * Math.sin(state.clock.elapsedTime * 1.5 + i));
      }
    });
  });

  return (
    <group ref={group} position={[0, -2.4, 4.4]}>
      {panels.map((p, i) => (
        <group key={i} position={[p[0], 0, p[1]]}>
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.05, 0.9]} />
            <meshStandardMaterial color="#0a1a3a" emissive={COLORS.electric} emissiveIntensity={0.3} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
            <meshStandardMaterial color={COLORS.chrome} metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─────────────────────────  POWER CORE (battery + inverter)  ───────────────────────── */
export function PowerCore({ batteryRef, inverterRef }: { batteryRef: React.MutableRefObject<number>; inverterRef: React.MutableRefObject<number> }) {
  const bat = useRef<THREE.Mesh>(null);
  const inv = useRef<THREE.Mesh>(null);
  const invScreen = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (bat.current) {
      const b = batteryRef.current;
      (bat.current.material as THREE.MeshStandardMaterial).emissiveIntensity = lerp(0.1, 2.2, b);
      bat.current.scale.setScalar(lerp(0.6, 1, clamp01(b * 1.4)));
    }
    if (inv.current && invScreen.current) {
      const iv = inverterRef.current;
      (invScreen.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        iv * (1.8 + 0.8 * Math.sin(state.clock.elapsedTime * 6));
      inv.current.scale.setScalar(lerp(0.6, 1, clamp01(iv * 1.4)));
    }
  });

  return (
    <group position={[-4.4, -0.4, 1]}>
      {/* battery */}
      <mesh ref={bat} position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 1.4, 0.5]} />
        <meshStandardMaterial color="#0d1420" emissive={COLORS.energy} emissiveIntensity={0.1} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* inverter */}
      <group position={[1.4, -0.1, 0.4]}>
        <mesh ref={inv}>
          <boxGeometry args={[0.7, 1.1, 0.35]} />
          <meshStandardMaterial color="#11161f" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh ref={invScreen} position={[0, 0.15, 0.19]}>
          <planeGeometry args={[0.45, 0.4]} />
          <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ─────────────────────────  ENERGY BEAMS  ───────────────────────── */
export function EnergyBeams({ flowRef }: { flowRef: React.MutableRefObject<number> }) {
  const curveA = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -1.4, 3.6),
        new THREE.Vector3(-2.2, -1, 2),
        new THREE.Vector3(-4.4, -0.4, 1),
      ]),
    []
  );
  const curveB = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4.4, -0.4, 1),
        new THREE.Vector3(-2.5, 0, 0.6),
        new THREE.Vector3(0, 0.2, 0.4),
      ]),
    []
  );
  const geomA = useMemo(() => new THREE.TubeGeometry(curveA, 48, 0.035, 8, false), [curveA]);
  const geomB = useMemo(() => new THREE.TubeGeometry(curveB, 48, 0.035, 8, false), [curveB]);

  const tubeA = useRef<THREE.Mesh>(null);
  const tubeB = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const f = flowRef.current;
    [tubeA, tubeB].forEach((t) => {
      if (t.current) {
        (t.current.material as THREE.MeshBasicMaterial).opacity = f * 0.9;
        t.current.visible = f > 0.02;
      }
    });
    if (pulse.current) {
      const t = (state.clock.elapsedTime * 0.35) % 1;
      pulse.current.position.copy(curveA.getPoint(t));
      pulse.current.visible = f > 0.05;
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = f;
    }
  });

  return (
    <group>
      <mesh ref={tubeA} geometry={geomA}>
        <meshBasicMaterial color={COLORS.energy} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={tubeB} geometry={geomB}>
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.11, 12, 12]} />
        <meshBasicMaterial color={COLORS.energy} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────  ENERGY SHIELD  ───────────────────────── */
export function EnergyShield({ shieldRef }: { shieldRef: React.MutableRefObject<number> }) {
  const shell = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const s = shieldRef.current;
    [shell, wire].forEach((r) => {
      if (r.current) {
        r.current.visible = s > 0.02;
        r.current.rotation.y += delta * 0.15;
        r.current.scale.setScalar(lerp(0.2, 4.6, s));
      }
    });
    if (shell.current) (shell.current.material as THREE.MeshBasicMaterial).opacity = s * (0.12 + 0.05 * Math.sin(state.clock.elapsedTime * 2));
    if (wire.current) (wire.current.material as THREE.MeshBasicMaterial).opacity = s * 0.4;
  });

  return (
    <group position={[0, 0.4, 0]}>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────  FLOATING PARTICLES  ───────────────────────── */
export function FieldParticles({ count = 220 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 22;
      a[i * 3 + 1] = Math.random() * 12 - 3;
      a[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    return a;
  }, [count]);

  useFrame((state, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color={COLORS.cyan} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
}

