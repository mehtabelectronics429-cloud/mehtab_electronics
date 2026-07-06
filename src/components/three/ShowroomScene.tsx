"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { smoothstep, clamp01, lerp } from "@/lib/three-utils";
import {
  SmartHouse, SecurityCameras, SolarArray, PowerCore, EnergyBeams, EnergyShield, FieldParticles,
} from "./models";
import SceneEffects from "./Effects";

type R = React.MutableRefObject<number>;

function SceneDirector({
  progress, refs,
}: {
  progress: MotionValue<number>;
  refs: { glow: R; camReveal: R; scan: R; rise: R; battery: R; flow: R; inverter: R; shield: R };
}) {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    const p = clamp01(progress.get());

    refs.glow.current = 0.22 * smoothstep(0, 0.14, p) + 0.78 * smoothstep(0.85, 1, p);
    refs.camReveal.current = smoothstep(0.16, 0.28, p);
    refs.scan.current = clamp01(smoothstep(0.18, 0.26, p) - smoothstep(0.33, 0.42, p));
    refs.rise.current = smoothstep(0.36, 0.52, p);
    refs.flow.current = smoothstep(0.54, 0.64, p);
    refs.battery.current = smoothstep(0.54, 0.68, p);
    refs.inverter.current = smoothstep(0.7, 0.82, p);
    refs.shield.current = smoothstep(0.86, 1, p);

    // cinematic orbit
    const angle = lerp(-0.55, 1.5, p);
    const radius = 9.4 - 2.2 * smoothstep(0.3, 0.75, p);
    const height = lerp(2.4, 4.6, p) - 1.1 * smoothstep(0.36, 0.55, p);
    const cx = Math.sin(angle) * radius + pointer.x * 0.7;
    const cz = Math.cos(angle) * radius;
    const cy = height + pointer.y * 0.4;

    camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.06);
    target.current.lerp(new THREE.Vector3(0, lerp(0, 0.7, p), 0), 0.06);
    camera.lookAt(target.current);
  });

  return null;
}

function Lights({ riseRef }: { riseRef: R }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    if (sun.current) sun.current.intensity = 0.6 + riseRef.current * 2.2;
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight ref={sun} position={[6, 9, 4]} intensity={0.6} color="#fff3e0" castShadow />
      <pointLight position={[0, 2, 4]} intensity={40} color="#22E0FF" distance={16} />
      <pointLight position={[-5, 1, 2]} intensity={30} color="#2E6BFF" distance={16} />
      <pointLight position={[4, 3, -3]} intensity={20} color="#38F6A4" distance={16} />
    </>
  );
}

export default function ShowroomScene({ progress }: { progress: MotionValue<number> }) {
  const refs = {
    glow: useRef(0), camReveal: useRef(0), scan: useRef(0), rise: useRef(0),
    battery: useRef(0), flow: useRef(0), inverter: useRef(0), shield: useRef(0),
  };

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [4, 3, 9], fov: 42 }}
      className="!absolute inset-0"
    >
      <fog attach="fog" args={["#04060B", 12, 26]} />
      <Lights riseRef={refs.rise} />
      <SceneDirector progress={progress} refs={refs} />

      <SmartHouse glowRef={refs.glow} />
      <SecurityCameras revealRef={refs.camReveal} scanRef={refs.scan} />
      <SolarArray riseRef={refs.rise} />
      <PowerCore batteryRef={refs.battery} inverterRef={refs.inverter} />
      <EnergyBeams flowRef={refs.flow} />
      <EnergyShield shieldRef={refs.shield} />
      <FieldParticles />
      <SceneEffects bloomIntensity={1.2} threshold={0.16} />
    </Canvas>
  );
}
