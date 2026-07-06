"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { TESTIMONIALS } from "@/lib/data";
import { Quote, Star } from "lucide-react";

export default function Testimonials() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40">
      <SectionHeading
        eyebrow="Client voices"
        title={<>Trusted by homes & <span className="text-gradient">businesses</span>.</>}
        intro="A few words from people who now generate their own power and sleep a little easier."
      />
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={(i % 2) * 0.1}>
            <figure className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl glass hairline p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan/25">
              <Quote className="h-8 w-8 text-cyan/40" />
              <blockquote className="mt-5 text-lg leading-relaxed text-fg/85">“{t.quote}”</blockquote>
              <figcaption className="mt-8 flex items-center justify-between border-t border-fg/10 pt-6">
                <div>
                  <div className="font-display text-sm text-fg">{t.name}</div>
                  <div className="mt-1 text-xs text-fg/50">{t.role}</div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-solar text-solar" />
                  ))}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
