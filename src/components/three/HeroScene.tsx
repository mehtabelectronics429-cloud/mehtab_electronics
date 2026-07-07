"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { snoise } from "./glsl-noise";
import SceneEffects from "./Effects";

/* ─────────────  Morphing noise particle sphere  ───────────── */
function MorphSphere({ progress }: { progress?: MotionValue<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const mouse = useRef(new THREE.Vector2());

  const positions = useMemo(() => {
    const n = 5200;
    const a = new Float32Array(n * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      a[i * 3] = Math.cos(th) * r;
      a[i * 3 + 1] = y;
      a[i * 3 + 2] = Math.sin(th) * r;
    }
    return a;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uScale: { value: 1 },
    uSize: { value: 7 },
    uColorA: { value: new THREE.Color("#22E0FF") },
    uColorB: { value: new THREE.Color("#2E6BFF") },
  }), []);

  useFrame((state, delta) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mouse.current.lerp(pointer, 0.05);
    mat.current.uniforms.uMouse.value.copy(mouse.current);
    const p = progress ? progress.get() : 0;
    mat.current.uniforms.uScale.value = 1 + p * 0.45;
    if (group.current) {
      group.current.rotation.y += delta * 0.06;
      group.current.rotation.x = mouse.current.y * 0.25;
    }
  });

  const vertex = /* glsl */ `
    uniform float uTime; uniform vec2 uMouse; uniform float uScale; uniform float uSize;
    varying float vN;
    ${snoise}
    void main(){
      vec3 dir = normalize(position);
      float n = snoise(dir * 1.5 + uTime * 0.15);
      float breathe = sin(uTime * 0.8) * 0.05;
      vec3 mdir = normalize(vec3(uMouse, 0.6));
      float mInf = max(dot(dir, mdir), 0.0);
      float r = 1.75 * uScale + n * 0.42 + breathe + mInf * 0.3 * sin(uTime * 2.0);
      vec4 mv = modelViewMatrix * vec4(dir * r, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * (300.0 / -mv.z);
      vN = n;
    }`;
  const fragment = /* glsl */ `
    uniform vec3 uColorA; uniform vec3 uColorB; varying float vN;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float a = smoothstep(0.5, 0.12, d);
      vec3 c = mix(uColorA, uColorB, clamp(vN * 0.5 + 0.5, 0.0, 1.0));
      gl_FragColor = vec4(c, a * 0.92);
    }`;

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <shaderMaterial ref={mat} args={[{ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }]} />
      </points>
    </group>
  );
}

/* ─────────────  Large soft mouse-reactive particle field  ───────────── */
function ParticleField({ count = 4000 }: { count?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();
  const mouse = useRef(new THREE.Vector2());

  const { positions, scales, blurs, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const blurs = new Float32Array(count);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      scales[i] = Math.random() * 1.1 + 0.5;   // → ~4–12px after uSize
      blurs[i] = Math.random() > 0.6 ? 1 : 0;   // ~40% soft/blurred
      speeds[i] = Math.random() * 0.5 + 0.15;
    }
    return { positions, scales, blurs, speeds };
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uSize: { value: 9 },
    uColor: { value: new THREE.Color("#7fe9ff") },
  }), []);

  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mouse.current.lerp(pointer, 0.045); // inertia
    mat.current.uniforms.uMouse.value.copy(mouse.current);
  });

  const vertex = /* glsl */ `
    uniform float uTime; uniform vec2 uMouse; uniform float uSize;
    attribute float aScale; attribute float aBlur; attribute float aSpeed;
    varying float vBlur; varying float vAlpha;
    void main(){
      vec3 p = position;
      p.x += sin(uTime * aSpeed + p.y * 0.4) * 0.4;
      p.y += cos(uTime * aSpeed * 0.8 + p.x * 0.4) * 0.35;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      vec2 m = uMouse * vec2(9.0, 5.0);
      vec2 d = mv.xy - m;
      float dist = length(d);
      float force = smoothstep(3.2, 0.0, dist);
      mv.xy += normalize(d + 0.0001) * force * 1.3;      // repel
      mv.z += sin(dist * 1.1 - uTime * 1.6) * force * 0.7; // wave
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (uSize * aScale) * (300.0 / -mv.z);
      vBlur = aBlur;
      vAlpha = clamp(1.3 - (-mv.z) / 9.0, 0.12, 1.0);
    }`;
  const fragment = /* glsl */ `
    uniform vec3 uColor; varying float vBlur; varying float vAlpha;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float inner = mix(0.34, 0.02, vBlur);
      float a = smoothstep(0.5, inner, d);
      float op = mix(0.85, 0.38, vBlur);
      gl_FragColor = vec4(uColor, a * vAlpha * op);
    }`;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aBlur" args={[blurs, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={mat} args={[{ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }]} />
    </points>
  );
}

function Rig({ progress }: { progress?: MotionValue<number> }) {
  const { camera, pointer } = useThree();
  const pos = useRef(new THREE.Vector3(0, 0, 6));
  useFrame(() => {
    const p = progress ? progress.get() : 0;
    pos.current.set(pointer.x * 0.6, pointer.y * 0.4, 6 - p * 1.6);
    camera.position.lerp(pos.current, 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene({ progress, count = 4000 }: { progress?: MotionValue<number>; count?: number }) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 6], fov: 55 }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 2, 4]} intensity={30} color="#22E0FF" />
      <Rig progress={progress} />
      <MorphSphere progress={progress} />
      <ParticleField count={count} />
      <SceneEffects bloomIntensity={1.15} threshold={0.15} />
    </Canvas>
  );
}
