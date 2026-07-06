"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import SmartImage from "@/components/ui/SmartImage";
import { PROJECTS } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";

export default function Projects() {
  return (
    <section id="projects" className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Selected work"
          title={<>Installations we're <span className="text-gradient">proud of</span>.</>}
        />
        <Reveal delay={0.1}>
          <p className="max-w-sm text-sm text-fg/50">From single villas to 480kW farms and 128-camera corporate grids — engineered end to end.</p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.title} delay={(i % 3) * 0.08}>
            <article className="sheen group relative aspect-[4/5] overflow-hidden rounded-3xl glass hairline">
              <SmartImage src={p.image} alt={p.title} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full glass hairline px-3 py-1 text-[0.7rem] uppercase tracking-widest text-cyan">{p.tag}</span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base leading-tight text-fg">{p.title}</h3>
                    <p className="mt-2 text-xs text-fg/60">{p.type}</p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full glass hairline text-fg transition-all duration-500 group-hover:bg-cyan group-hover:text-obsidian">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
