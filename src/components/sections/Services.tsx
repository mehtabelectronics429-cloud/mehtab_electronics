"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import SmartImage from "@/components/ui/SmartImage";
import { SERVICES } from "@/lib/data";
import { cn } from "@/lib/utils";

const accentText: Record<string, string> = {
  electric: "text-electric", cyan: "text-cyan", solar: "text-solar", energy: "text-energy",
};
const accentGlow: Record<string, string> = {
  electric: "group-hover:shadow-[0_0_60px_-20px_rgba(46,107,255,0.8)]",
  cyan: "group-hover:shadow-[0_0_60px_-20px_rgba(34,224,255,0.8)]",
  solar: "group-hover:shadow-[0_0_60px_-20px_rgba(255,138,52,0.8)]",
  energy: "group-hover:shadow-[0_0_60px_-20px_rgba(56,246,164,0.8)]",
};

export default function Services() {
  return (
    <section id="services" className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40">
      <SectionHeading
        eyebrow="What we do"
        align="center"
        title={<>Solar & security, <span className="text-gradient">engineered right</span>.</>}
        intro="Professional solar panel setups, inverters and CCTV installation — designed and maintained by one accountable team."
      />

      <div className="mt-16 grid auto-rows-[minmax(180px,auto)] grid-cols-2 gap-4 md:grid-cols-4">
        {SERVICES.map((s, i) => (
          <Reveal
            key={s.key}
            delay={(i % 4) * 0.06}
            className={cn(
              s.span === "wide" && "col-span-2",
              s.span === "tall" && "row-span-2",
            )}
          >
            <article className={cn("sheen group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl glass hairline p-6 transition-all duration-500 hover:-translate-y-1.5", accentGlow[s.accent])}>
              {s.image && (
                <div className="absolute inset-0 -z-10 opacity-40 transition-opacity duration-500 group-hover:opacity-60">
                  <SmartImage src={s.image} alt={s.title} className="h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
                </div>
              )}
              <span className={cn("grid h-11 w-11 place-items-center rounded-xl bg-fg/5 ring-1 ring-fg/10", accentText[s.accent])}>
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <div className="mt-6">
                <h3 className="font-display text-sm leading-snug tracking-wide text-fg">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-fg/55">{s.blurb}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
