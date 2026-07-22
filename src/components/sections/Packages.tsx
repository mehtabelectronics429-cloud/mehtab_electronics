"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import { PACKAGES } from "@/lib/data";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ring: Record<string, string> = {
  cyan: "hover:border-cyan/40",
  solar: "hover:border-solar/40",
  electric: "hover:border-electric/40",
};

export default function Packages() {
  return (
    <section
      id="packages"
      className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40"
    >
      <SectionHeading
        eyebrow="Packages"
        align="center"
        title={
          <>
            Start with a <span className="text-gradient">package</span>,
            tailored to you.
          </>
        }
        intro="Transparent starting points  every system is right-sized after a free site survey."
      />
      <div className="mt-16 grid items-stretch gap-5 lg:grid-cols-3">
        {PACKAGES.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.1}>
            <div
              className={cn(
                "relative flex h-full flex-col rounded-[2rem] glass hairline p-8 transition-all duration-500 hover:-translate-y-2",
                ring[p.accent],
                p.featured && "lg:-mt-4 lg:mb-4 ring-1 ring-cyan/30",
              )}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-electric to-cyan px-4 py-1 text-[0.65rem] uppercase tracking-widest text-white">
                  {p.tag}
                </span>
              )}
              {!p.featured && <span className="kicker">{p.tag}</span>}
              <h3 className="mt-3 font-display text-xl text-fg">{p.name}</h3>
              <p className="mt-2 text-sm text-fg/55">{p.blurb}</p>
              <div className="mt-5 font-display text-2xl text-gradient">
                {p.price}
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm text-fg/75"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-energy" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <MagneticButton
                  href="/contact"
                  variant={p.featured ? "primary" : "ghost"}
                  className="w-full justify-center"
                >
                  Get this setup
                </MagneticButton>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
