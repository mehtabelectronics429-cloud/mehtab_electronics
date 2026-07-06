"use client";

import { useRef, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import SmartImage from "@/components/ui/SmartImage";
import { BEFORE_AFTER } from "@/lib/data";
import { MoveHorizontal } from "lucide-react";

function Slider({ label, before, after }: { label: string; before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div>
      <div
        ref={ref}
        className="group relative aspect-[16/10] cursor-ew-resize select-none overflow-hidden rounded-3xl glass hairline"
        onMouseMove={(e) => e.buttons === 1 && onMove(e.clientX)}
        onClick={(e) => onMove(e.clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
      >
        <SmartImage src={after} alt={`${label} after`} className="absolute inset-0 h-full w-full" />
        <span className="absolute right-4 top-4 z-10 rounded-full glass hairline px-3 py-1 text-[0.7rem] uppercase tracking-widest text-energy">After</span>

        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <SmartImage src={before} alt={`${label} before`} className="absolute inset-0 h-full w-full [filter:grayscale(0.4)_brightness(0.7)]" />
          <span className="absolute left-4 top-4 z-10 rounded-full glass hairline px-3 py-1 text-[0.7rem] uppercase tracking-widest text-fg/70">Before</span>
        </div>

        <div className="absolute inset-y-0 z-20 w-0.5 bg-fg/80" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 -ml-5 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-obsidian shadow-glow">
            <MoveHorizontal className="h-4 w-4" />
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-fg/60">{label}</p>
    </div>
  );
}

export default function BeforeAfter() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40">
      <SectionHeading
        eyebrow="Before / After"
        align="center"
        title={<>Watch the <span className="text-gradient">transformation</span>.</>}
        intro="Drag the handle to see the difference a Mehtab installation makes. Real sites, real results."
      />
      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        {BEFORE_AFTER.map((b, i) => (
          <Reveal key={b.label} delay={i * 0.1}>
            <Slider {...b} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
