import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  SunMedium,
  BatteryCharging,
  Gauge,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Slideshow from "@/components/ui/Slideshow";
import Reveal from "@/components/ui/Reveal";
import Contact from "@/components/sections/Contact";
import { SOLAR_PANELS, INVERTERS, BATTERIES, HERO_SOLAR } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Solar System Installation  Mehtab Electronics",
  description:
    "On-grid, off-grid and hybrid solar systems from 3 kW homes to 50 kW commercial. Tier-1 panels, hybrid inverters, batteries and net-metering  installed across Punjab since 1996.",
};

const FEATURES = [
  {
    icon: SunMedium,
    title: "Tier-1 solar panels",
    body: "Longi & JinKO mono-PERC modules sized to your roof and daily load for maximum yield.",
  },
  {
    icon: Zap,
    title: "Hybrid inverters",
    body: "Inverex, itel and Solis hybrid inverters with dual MPPT and WiFi monitoring.",
  },
  {
    icon: BatteryCharging,
    title: "Battery backup",
    body: "Lithium and tubular battery banks so essential loads keep running through outages.",
  },
  {
    icon: Gauge,
    title: "Net-metering handled",
    body: "We prepare and submit the full net-metering application and bi-directional meter paperwork.",
  },
  {
    icon: ShieldCheck,
    title: "Genuine warranty",
    body: "Manufacturer warranties on panels & inverters, plus our own workmanship guarantee.",
  },
  {
    icon: Wrench,
    title: "After-sales support",
    body: "Scheduled health checks and priority call-outs keep your system performing for years.",
  },
];

const STEPS = [
  {
    n: "01",
    t: "Free survey",
    b: "We visit, map your load, roof angles and shading, then model the ideal system size.",
  },
  {
    n: "02",
    t: "Fixed quote",
    b: "You get an itemised bill of materials, generation forecast and a clear fixed price.",
  },
  {
    n: "03",
    t: "Clean install",
    b: "Certified crews mount panels, wire inverters and batteries with tidy, labelled conduit.",
  },
  {
    n: "04",
    t: "Commission & monitor",
    b: "We test everything, complete net-metering and set up remote monitoring on your phone.",
  },
];

const PANEL_SLIDES = SOLAR_PANELS.slice(0, 6).map((src, i) => ({
  src,
  sub: "Solar installation",
  caption:
    [
      "Rooftop array",
      "Commercial rooftop",
      "Ground-mount array",
      "Residential rooftop",
      "Shed-mount system",
      "Elevated array",
    ][i] ?? "Solar install",
}));
const KIT_SLIDES = [...INVERTERS.slice(0, 4), ...BATTERIES.slice(0, 2)].map(
  (src) => ({
    src,
    sub: "Inverter & backup",
    caption: "Installed inverter + DB",
  }),
);

export default function SolarServicePage() {
  return (
    <main>
      <PageHero
        crumb="Solar Systems"
        eyebrow="Service · Solar"
        title={
          <>
            Solar systems,{" "}
            <span className="text-gradient">installed clean</span>.
          </>
        }
        subtitle="On-grid, off-grid and hybrid solar  from 3 kW homes to 50 kW commercial. Designed around your load and installed to last."
        image={HERO_SOLAR}
        chips={[
          "On-grid & hybrid",
          "Net-metering",
          "Battery backup",
          "3–50 kW",
        ]}
      />

      {/* features */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mono-label">Why our solar</div>
          <h2 className="mt-4 display-lg max-w-3xl text-fg">
            Engineered for real Pakistani homes.
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-lg border border-line/15 bg-surface/40 p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand/40">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-brand/10 text-brand ring-1 ring-brand/20">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg uppercase tracking-wide text-fg">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg/60">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* gallery slideshows */}
      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mono-label">Recent installs</div>
          <h2 className="mt-4 display-lg text-fg">Real jobs across Punjab.</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Slideshow slides={PANEL_SLIDES} aspect="aspect-[4/3]" />
            <Slideshow
              slides={KIT_SLIDES}
              aspect="aspect-[4/3]"
              interval={5200}
            />
          </div>
        </div>
      </section>

      {/* process */}
      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mono-label">How it works</div>
          <h2 className="mt-4 display-lg text-fg">From survey to switch-on.</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-lg border border-line/15 bg-surface/40 p-6 shadow-card"
              >
                <div className="font-display text-4xl text-brand">{s.n}</div>
                <h3 className="mt-3 font-display text-lg uppercase tracking-wide text-fg">
                  {s.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg/60">{s.b}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/contact" className="btn-brand">
              Get a free quote <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/products/solar-panels" className="btn-outline">
              Browse solar products
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
            {[
              "Tier-1 panels & inverters",
              "Batteries & backup ready",
              "Net-metering handled",
              "After-sales support",
            ].map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-sm text-fg/70"
              >
                <Check className="h-4 w-4 text-brand" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Contact />
    </main>
  );
}
