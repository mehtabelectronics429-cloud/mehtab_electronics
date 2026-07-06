"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import SceneEffects from "./Effects";
import { COLORS } from "@/lib/three-utils";

const R = 2.1;

function fibonacciSphere(n: number, r: number) {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * rad * r, y * r, Math.sin(theta) * rad * r));
  }
  return pts;
}

function Arc({ from, to, color, offset }: { from: THREE.Vector3; to: THREE.Vector3; color: string; offset: number }) {
  const pulse = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5).setLength(R + 0.9 + from.distanceTo(to) * 0.25);
    return new THREE.QuadraticBezierCurve3(from, mid, to);
  }, [from, to]);
  const geom = useMemo(() => new THREE.TubeGeometry(curve, 40, 0.012, 6, false), [curve]);

  useFrame((state) => {
    if (!pulse.current) return;
    const t = (state.clock.elapsedTime * 0.35 + offset) % 1;
    pulse.current.position.copy(curve.getPoint(t));
    const s = 0.6 + 0.4 * Math.sin(t * Math.PI);
    pulse.current.scale.setScalar(s);
  });

  return (
    <group>
      <mesh geometry={geom}>
        <meshBasicMaterial color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Globe() {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const nodes = useMemo(() => fibonacciSphere(90, R), []);
  const cloud = useMemo(() => {
    const p = fibonacciSphere(700, R);
    const arr = new Float32Array(p.length * 3);
    p.forEach((v, i) => { arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z; });
    return arr;
  }, []);

  const arcs = useMemo(() => {
    const palette = [COLORS.cyan, COLORS.electric, COLORS.energy];
    return Array.from({ length: 16 }).map((_, i) => ({
      from: nodes[Math.floor(Math.random() * nodes.length)],
      to: nodes[Math.floor(Math.random() * nodes.length)],
      color: palette[i % palette.length],
      offset: Math.random(),
    }));
  }, [nodes]);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.3, 0.05);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, pointer.x * 0.4, 0.05);
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cloud, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.035} color={COLORS.cyan} transparent opacity={0.7} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh>
        <icosahedronGeometry args={[R, 2]} />
        <meshBasicMaterial color={COLORS.electric} wireframe transparent opacity={0.08} />
      </mesh>
      <mesh>
        <sphereGeometry args={[R * 0.98, 32, 32]} />
        <meshBasicMaterial color="#05070d" transparent opacity={0.85} />
      </mesh>
      {arcs.map((a, i) => <Arc key={i} {...a} />)}
    </group>
  );
}

export default function EnergyGlobe() {
  return (
    <Canvas
      dpr={[1, 1.7]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6.5], fov: 45 }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 3, 5]} intensity={30} color={COLORS.cyan} />
      <Globe />
      <SceneEffects bloomIntensity={1.4} threshold={0.1} />
    </Canvas>
  );
}
