"use client";

import Link from "next/link";
import { ExternalLink, ShieldCheck, Zap } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { CNC_AUTHORIZED } from "@/lib/assets";

/**
 * CNC Electric authorization band — showroom proof + brand facts.
 * CNC Electric (cncele.com) is a global LV / new-energy manufacturer;
 * Mehtab Electronics stocks and supplies their switchgear for solar & DB work.
 */
export default function CNCAuthorized() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand/[0.04] via-transparent to-transparent" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 md:px-8 lg:grid-cols-2 lg:gap-14">
        <div className="order-2 lg:order-1">
          <div className="mono-label">Authorized partner</div>
          <h2 className="mt-4 display-md text-fg">
            Officially authorized by{" "}
            <span className="text-gradient">CNC Electric</span>.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-fg/60 md:text-base">
            {CNC_AUTHORIZED.blurb}
          </p>

          <ul className="mt-8 space-y-3">
            {CNC_AUTHORIZED.highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-fg/75"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-line/15 bg-surface/70 px-4 py-2 text-xs font-medium uppercase tracking-wider text-fg">
              <Zap className="h-3.5 w-3.5 text-brand" />
              {CNC_AUTHORIZED.badge}
            </span>
            <a
              href={CNC_AUTHORIZED.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-fg/50 transition-colors hover:text-brand"
            >
              cncele.com <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 border-b border-brand/50 pb-0.5 text-xs font-medium uppercase tracking-[0.16em] text-brand"
            >
              Ask for CNC stock
            </Link>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="overflow-hidden rounded-2xl border border-line/15 bg-surface/40 shadow-card">
            <div className="relative aspect-[3/4] w-3/6 mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-brand/20 via-surface to-cyan/10">
              <SmartImage
                src={CNC_AUTHORIZED.image}
                alt="Mehtab Electronics CNC Electric authorized showroom display — Narowal"
                className="h-full w-full"
                imgClassName="object-cover"
                priority
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line/10 px-4 py-3">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-fg/45">
                Showroom · Narowal
              </p>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand">
                CNC Electric stocked
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
