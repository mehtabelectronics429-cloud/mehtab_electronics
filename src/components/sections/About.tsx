"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import GlassCard from "@/components/ui/GlassCard";
import SmartImage from "@/components/ui/SmartImage";
import { img } from "@/lib/utils";
import { COMPANY } from "@/lib/data";
import { Target, Leaf, Cpu } from "lucide-react";

const pillars = [
  { icon: Cpu, title: "Engineering-first", body: "Every install is designed, load-calculated and commissioned by certified engineers — not guesswork." },
  { icon: Leaf, title: "Clean by default", body: "We treat energy independence and lower bills as the baseline, not a premium upsell." },
  { icon: Target, title: "One accountable partner", body: "Solar panels, inverters and security cameras under a single roof, warranty and support line." },
];

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Who we are"
            title={<>The energy & security studio for the <span className="text-gradient">next decade</span>.</>}
            intro={`Since ${COMPANY.founded}, ${COMPANY.name} has become one of Pakistan's trusted names in solar installation and CCTV security — merging Tier-1 hardware with professional installation craft.`}
          />
          <div className="mt-10 space-y-5">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <div className="flex gap-4">
                  <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-xl glass hairline text-cyan">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-display text-sm tracking-wide text-fg">{p.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-fg/55">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.15} className="relative">
          <GlassCard className="overflow-hidden p-2">
            <SmartImage src={img("photo-1600607687939-ce8a6c25118c", 1200)} alt="Modern smart home interior at dusk" className="aspect-[4/5] rounded-2xl" priority />
          </GlassCard>
          <div className="absolute -bottom-6 -left-6 hidden w-56 rounded-2xl glass hairline p-5 md:block">
            <div className="font-display text-3xl text-fg">18 MW</div>
            <div className="mt-1 text-xs text-fg/50">of solar deployed across Punjab & beyond</div>
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-cyan/30 blur-3xl" />
        </Reveal>
      </div>
    </section>
  );
}
