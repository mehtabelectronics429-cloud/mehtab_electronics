"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { SNOISE } from "./glsl-noise";
import SceneEffects from "./Effects";

/* ─────────── device-scaled quality ─────────── */
function quality() {
  if (typeof window === "undefined") return { field: 3200, detail: 22 };
  const w = window.innerWidth;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return { field: 900, detail: 10 };
  if (w < 768) return { field: 1400, detail: 12 };
  if (w < 1200) return { field: 2400, detail: 18 };
  return { field: 3800, detail: 24 };
}

/* ─────────── background: volumetric fog + rays + gradient ─────────── */
const bgVert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const bgFrag = /* glsl */ `
  uniform float uTime; uniform vec2 uMouse; varying vec2 vUv;
  ${SNOISE}
  float fbm(vec3 x){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*snoise(x); x*=2.0; a*=0.5;} return v; }
  void main(){
    vec2 uv = vUv;
    vec3 col = mix(vec3(0.010,0.020,0.043), vec3(0.020,0.065,0.140), uv.y);
    float f = fbm(vec3(uv*3.0 + vec2(uTime*0.03 + uMouse.x*0.1, uTime*0.02), uTime*0.05));
    col += vec3(0.03,0.13,0.30) * smoothstep(0.15,0.95,f) * 0.55;
    float ray = pow(max(0.0, 1.0 - abs(uv.x - 0.5 + 0.16*sin(uTime*0.1))*1.9), 3.0);
    col += vec3(0.10,0.30,0.60) * ray * 0.12 * (0.5 + 0.5*sin(uTime*0.2));
    float vig = smoothstep(1.15, 0.28, length(uv-0.5));
    col *= vig;
    gl_FragColor = vec4(col, 1.0);
  }`;

/* ─────────── large interactive particle field ─────────── */
const fieldVert = /* glsl */ `
  uniform float uTime; uniform vec2 uMouse; uniform float uDpr;
  attribute float aSize; attribute float aOpacity; attribute float aSharp; attribute vec3 aColor;
  varying float vOpacity; varying float vSharp; varying vec3 vColor;
  ${SNOISE}
  void main(){
    vColor = aColor; vOpacity = aOpacity; vSharp = aSharp;
    vec3 p = position;
    float t = uTime * 0.08;
    p.x += snoise(p*0.15 + vec3(t,0.0,0.0)) * 0.6;
    p.y += snoise(p*0.15 + vec3(0.0,t,10.0)) * 0.6;
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    vec2 m = uMouse * vec2(9.0,5.0);
    vec2 diff = mv.xy - m;
    float d = length(diff);
    float force = smoothstep(3.6, 0.0, d);
    mv.xy += normalize(diff + 0.0001) * force * 1.7;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uDpr * (150.0 / -mv.z);
  }`;
const fieldFrag = /* glsl */ `
  varying float vOpacity; varying float vSharp; varying vec3 vColor;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float edge = mix(0.5, 0.16, vSharp);
    float a = smoothstep(0.5, 0.5 - edge, d) * vOpacity;
    if(a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }`;

function Field({ count, uniforms }: { count: number; uniforms: any }) {
  const attrs = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const op = new Float32Array(count);
    const sharp = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color("#2E6BFF"), new THREE.Color("#22E0FF"), new THREE.Color("#cfe8ff")];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      size[i] = 4 + Math.random() * 8;         // 4–12px
      op[i] = 0.25 + Math.random() * 0.7;
      sharp[i] = Math.random();
      const c = palette[(Math.random() * palette.length) | 0];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return { pos, size, op, sharp, col };
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attrs.pos, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[attrs.size, 1]} />
        <bufferAttribute attach="attributes-aOpacity" args={[attrs.op, 1]} />
        <bufferAttribute attach="attributes-aSharp" args={[attrs.sharp, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[attrs.col, 3]} />
      </bufferGeometry>
      <shaderMaterial args={[{ uniforms, vertexShader: fieldVert, fragmentShader: fieldFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }]} />
    </points>
  );
}

/* ─────────── giant morphing particle sphere ─────────── */
const sphereVert = /* glsl */ `
  uniform float uTime; uniform vec2 uMouse; uniform float uDpr;
  varying float vGlow;
  ${SNOISE}
  void main(){
    vec3 n = normalize(position);
    float noise = snoise(n*1.6 + uTime*0.15);
    float noise2 = snoise(n*3.2 - uTime*0.10) * 0.5;
    float disp = noise + noise2;
    float mouseInf = smoothstep(0.35, 1.0, dot(n, normalize(vec3(uMouse*1.6, 1.0))));
    float amp = 0.26 + 0.12 * sin(uTime*0.8);
    vec3 p = position + n * disp * amp + n * mouseInf * 0.28;
    vGlow = smoothstep(-0.6, 1.2, disp);
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.4 + 2.4*vGlow) * uDpr * (150.0 / -mv.z);
  }`;
const sphereFrag = /* glsl */ `
  varying float vGlow;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.08, d);
    if(a < 0.02) discard;
    vec3 col = mix(vec3(0.13,0.42,1.0), vec3(0.25,0.92,1.0), vGlow);
    gl_FragColor = vec4(col, a * 0.9);
  }`;

function MorphSphere({ detail, uniforms, group }: { detail: number; uniforms: any; group: React.MutableRefObject<THREE.Group | null> }) {
  return (
    <group ref={group} position={[1.2, 0, 0]}>
      <points>
        <icosahedronGeometry args={[2.4, detail]} />
        <shaderMaterial args={[{ uniforms, vertexShader: sphereVert, fragmentShader: sphereFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }]} />
      </points>
    </group>
  );
}

/* ─────────── rig: uniforms, mouse inertia, scroll, camera parallax ─────────── */
function Rig({ scroll, mats, sphere }: {
  scroll: MotionValue<number>;
  mats: any[];
  sphere: React.MutableRefObject<THREE.Group | null>;
}) {
  const { camera, pointer } = useThree();
  const mouse = useRef(new THREE.Vector2());

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    mouse.current.lerp(pointer, 0.05); // inertia / easing → no jitter
    const s = scroll.get();
    mats.forEach((m) => {
      if (!m) return;
      m.uniforms.uTime.value = t;
      if (m.uniforms.uMouse) m.uniforms.uMouse.value.copy(mouse.current);
    });
    if (sphere.current) {
      sphere.current.rotation.y += delta * 0.08;
      sphere.current.rotation.x = mouse.current.y * 0.25;
      const sc = 1 + s * 0.4;
      sphere.current.scale.setScalar(sc);
    }
    // camera parallax + subtle scroll zoom
    camera.position.x += (mouse.current.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current.y * 0.4 - camera.position.y) * 0.04;
    camera.position.z += (9 - s * 1.5 - camera.position.z) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroParticles({ scroll }: { scroll: MotionValue<number> }) {
  const q = useMemo(() => quality(), []);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.8) : 1.5;

  const bgU = useMemo(() => ({ uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() } }), []);
  const fieldU = useMemo(() => ({ uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uDpr: { value: dpr } }), [dpr]);
  const sphereU = useMemo(() => ({ uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uDpr: { value: dpr } }), [dpr]);

  const sphereGroup = useRef<THREE.Group>(null);

  return (
    <Canvas dpr={[1, 1.8]} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} camera={{ position: [0, 0, 9], fov: 50 }} className="!absolute inset-0">
      {/* background */}
      <mesh position={[0, 0, -6]} scale={[42, 26, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial args={[{ uniforms: bgU, vertexShader: bgVert, fragmentShader: bgFrag, depthWrite: false }]} />
      </mesh>

      <ambientLight intensity={0.6} />
      <pointLight position={[4, 3, 5]} intensity={30} color="#22E0FF" />

      <Field count={q.field} uniforms={fieldU} />
      <MorphSphere detail={q.detail} uniforms={sphereU} group={sphereGroup} />

      <Rig scroll={scroll} mats={[{ uniforms: bgU }, { uniforms: fieldU }, { uniforms: sphereU }]} sphere={sphereGroup} />
      <SceneEffects bloomIntensity={1.25} threshold={0.12} />
    </Canvas>
  );
}
