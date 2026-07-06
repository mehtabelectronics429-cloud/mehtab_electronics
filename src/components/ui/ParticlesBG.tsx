"use client";

import dynamic from "next/dynamic";

const ShaderParticles = dynamic(() => import("@/components/three/ShaderParticles"), { ssr: false });

/** Reusable GPU particle backdrop. Mouse- & scroll-reactive, GPU-only.
 *  Pass z-index + opacity via `className`. */
export default function ParticlesBG({ color, count, size, className = "-z-10 opacity-70" }: { color?: string; count?: number; size?: number; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <ShaderParticles color={color} count={count} size={size} />
    </div>
  );
}
