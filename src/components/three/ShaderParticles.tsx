"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uSize;
  attribute float aScale;
  attribute float aSpeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // gentle drift + scroll-linked vertical travel
    p.y += sin(uTime * aSpeed + p.x * 0.5) * 0.6;
    p.x += cos(uTime * aSpeed * 0.8 + p.y * 0.5) * 0.5;
    p.z += sin(uTime * 0.3 + p.y) * 0.4;
    p.y += uScroll * 6.0 * aSpeed;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // mouse repulsion in view space
    vec2 toMouse = mv.xy - uMouse * 6.0;
    float d = length(toMouse);
    mv.xy += normalize(toMouse + 0.0001) * clamp(2.5 - d, 0.0, 2.5) * 0.6;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * (300.0 / -mv.z);
    vAlpha = clamp(1.2 - (-mv.z) / 22.0, 0.05, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, glow * vAlpha * uOpacity);
  }
`;

function Swarm({ count, color, size }: { count: number; color: string; size: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();
  const mouse = useRef(new THREE.Vector2());

  const { positions, scales, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
      scales[i] = Math.random() * 1.6 + 0.4;
      speeds[i] = Math.random() * 0.6 + 0.2;
    }
    return { positions, scales, speeds };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uScroll: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSize: { value: size },
      uOpacity: { value: 0.55 },
    }),
    [color, size]
  );

  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mouse.current.lerp(pointer, 0.06);
    mat.current.uniforms.uMouse.value.copy(mouse.current);
    const sp = typeof window !== "undefined"
      ? window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)
      : 0;
    mat.current.uniforms.uScroll.value = sp;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        args={[{ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }]}
      />
    </points>
  );
}

export default function ShaderParticles({ color = "#22E0FF", count = 700, size = 11 }: { color?: string; count?: number; size?: number }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 12], fov: 55 }}
      className="!absolute inset-0"
    >
      <Swarm count={count} color={color} size={size} />
      <Swarm count={Math.floor(count * 0.35)} color="#2E6BFF" size={size * 0.7} />
    </Canvas>
  );
}
