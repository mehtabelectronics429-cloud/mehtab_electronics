"use client";

import Image from "next/image";
import { PARTNER_LOGOS } from "@/lib/assets";

// Repeat the set so the track is wide enough to fill any viewport, then the
// -50% translate loops seamlessly (each half is identical).
const HALF = [...PARTNER_LOGOS, ...PARTNER_LOGOS];
const TRACK = [...HALF, ...HALF];

function LogoCard({ name, role, src }: { name: string; role: string; src: string }) {
  return (
    <div className="mx-3 flex w-44 shrink-0 flex-col items-center justify-center rounded-lg bg-white px-5 py-6 shadow-card ring-1 ring-black/5">
      <div className="flex h-12 items-center justify-center">
        <Image
          src={src}
          alt={`${name} logo`}
          width={140}
          height={48}
          loading="eager"
          className="h-9 w-auto object-contain"
        />
      </div>
      <span className="mt-3 text-center font-mono text-[0.52rem] uppercase tracking-[0.14em] text-neutral-500">
        {role}
      </span>
    </div>
  );
}

export default function Partners() {
  return (
    <section className="relative overflow-hidden py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 text-center md:px-8">
        <div className="mono-label">Certified &amp; authorized</div>
        <h2 className="mt-4 display-md text-fg">Backed by the biggest names.</h2>
      </div>

      {/* auto-scrolling marquee (right → left) */}
      <div className="group relative mt-12">
        {/* soft edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent md:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent md:w-28" />

        <div className="flex w-max animate-marquee items-stretch group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {TRACK.map((p, i) => (
            <LogoCard key={`${p.name}-${i}`} name={p.name} role={p.role} src={p.src} />
          ))}
        </div>
      </div>
    </section>
  );
}
