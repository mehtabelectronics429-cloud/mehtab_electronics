"use client";

import dynamic from "next/dynamic";

const ParticleField = dynamic(() => import("@/components/three/ParticleField"), { ssr: false });

export default function ParticleFieldBG({ color, count }: { color?: string; count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-70">
      <ParticleField color={color} count={count} />
    </div>
  );
}
