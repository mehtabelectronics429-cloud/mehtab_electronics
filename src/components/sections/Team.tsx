"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import SmartImage from "@/components/ui/SmartImage";
import { TEAM } from "@/lib/data";

export default function Team() {
  return (
    <section id="team" className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40">
      <SectionHeading
        eyebrow="The people"
        title={<>Engineers who <span className="text-gradient">obsess</span> over the details.</>}
        intro="A tight, senior team that designs, installs and stands behind every system we deploy."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM.map((m, i) => (
          <Reveal key={m.name} delay={(i % 4) * 0.08}>
            <TiltCard className="group relative overflow-hidden rounded-3xl glass hairline">
              <div className="relative aspect-[4/5]">
                <SmartImage src={m.image} alt={m.name} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04060B] via-[#04060B]/30 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full glass hairline px-3 py-1 text-[0.65rem] uppercase tracking-widest text-cyan">{m.focus}</span>
                <div className="absolute inset-x-0 bottom-0 p-5" style={{ transform: "translateZ(40px)" }}>
                  <h3 className="font-display text-base text-white">{m.name}</h3>
                  <p className="mt-1 text-xs text-white/60">{m.role}</p>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
