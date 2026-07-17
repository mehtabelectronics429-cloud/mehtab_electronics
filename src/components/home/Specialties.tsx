"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, SunMedium, PackageOpen, Cctv } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { SPECIALTIES } from "@/lib/data";

const ICONS: Record<string, typeof SunMedium> = { SunMedium, PackageOpen, Cctv };

export default function Specialties() {
  return (
    <section id="services" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mono-label">What we do</div>
        <h2 className="mt-4 display-lg max-w-3xl text-fg">
          Three specialties.
          <br />
          <span className="text-accent">One trusted team.</span>
        </h2>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {SPECIALTIES.map((s, i) => {
            const Icon = ICONS[s.icon] ?? SunMedium;
            return (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col overflow-hidden rounded-lg border border-line/15 bg-surface/40 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-lg"
              >
                {/* image header */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <SmartImage
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
                  <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-md bg-brand text-on-brand shadow-glow-brand">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <span className="absolute right-4 top-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-fg/70">
                    {s.tag}
                  </span>
                </div>

                {/* body */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl uppercase tracking-wide text-fg">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-fg/60">{s.blurb}</p>

                  <ul className="mt-5 space-y-2.5">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-fg/75">
                        <Check className="h-4 w-4 shrink-0 text-brand" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={s.href}
                    className="mt-6 inline-flex items-center gap-1.5 self-start border-b border-brand/60 pb-0.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand transition-colors hover:border-brand"
                  >
                    Explore <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
