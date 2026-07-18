import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Cctv, Moon, Smartphone, HardDrive, ShieldCheck, Wifi } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/ui/Reveal";
import Contact from "@/components/sections/Contact";
import { CAMERA } from "@/lib/assets";

export const metadata: Metadata = {
  title: "CCTV & Security Installation — Mehtab Electronics",
  description:
    "HD & 4K IP camera networks with mobile viewing, night vision and DVR/NVR storage. Neat conduit runs and tested playback — installed across Punjab.",
};

const FEATURES = [
  { icon: Cctv, title: "2 MP – 8 MP cameras", body: "Bullet, dome and PTZ cameras in HD, 2K and 4K to match every budget and coverage need." },
  { icon: Moon, title: "Colour night vision", body: "ColorVu and IR cameras keep your property clearly visible around the clock." },
  { icon: Smartphone, title: "Mobile viewing", body: "Live feeds and playback on iOS & Android — watch your property from anywhere." },
  { icon: HardDrive, title: "DVR / NVR storage", body: "Local recording with the storage you need, plus optional cloud backup." },
  { icon: Wifi, title: "Remote setup", body: "We configure remote viewing, alerts and user accounts before we leave site." },
  { icon: ShieldCheck, title: "Weather-sealed", body: "IP66/IP67 outdoor housings and tidy, protected conduit runs that last." },
];

const STEPS = [
  { n: "01", t: "Site walk", b: "We map entry points, blind spots and cable routes for full coverage." },
  { n: "02", t: "Design & quote", b: "Camera count, resolution, storage and a clear fixed price." },
  { n: "03", t: "Neat install", b: "Weather-sealed cameras, tidy conduit and a tested recorder." },
  { n: "04", t: "Handover", b: "Mobile app, remote viewing and playback set up and demonstrated." },
];

export default function CctvServicePage() {
  return (
    <main>
      <PageHero
        crumb="CCTV & Security"
        eyebrow="Service · Security"
        title={<>Eyes on everything, <span className="text-gradient">day and night</span>.</>}
        subtitle="HD & 4K IP camera networks with mobile viewing, night vision and DVR/NVR storage — neat conduit runs and tested playback."
        image={CAMERA}
        chips={["2–8 MP", "Night vision", "Mobile app", "NVR / DVR"]}
      />

      {/* showcase + features */}
      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-lg border border-line/15 bg-surface/40 shadow-card">
              <SmartImage src={CAMERA} alt="CCTV camera" className="aspect-[4/3] w-full" />
            </div>
            <div>
              <div className="mono-label">Why our CCTV</div>
              <h2 className="mt-4 display-lg text-fg">Coverage you can trust.</h2>
              <p className="lead mt-5 max-w-lg">
                From a 4-camera home kit to a multi-camera business grid — we plan overlapping fields
                of view, install cleanly and hand over a system you can actually use.
              </p>
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {["Bullet, dome & PTZ", "Two-way audio options", "Motion alerts", "Cabling included"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-fg/75"><Check className="h-4 w-4 text-brand" /> {f}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-brand">Get a free quote <ArrowUpRight className="h-4 w-4" /></Link>
                <Link href="/products/cameras" className="btn-outline">Browse cameras</Link>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-lg border border-line/15 bg-surface/40 p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand/40">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-brand/10 text-brand ring-1 ring-brand/20">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg uppercase tracking-wide text-fg">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg/60">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* process */}
      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mono-label">How it works</div>
          <h2 className="mt-4 display-lg text-fg">Simple, tidy, tested.</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-lg border border-line/15 bg-surface/40 p-6 shadow-card">
                <div className="font-display text-4xl text-brand">{s.n}</div>
                <h3 className="mt-3 font-display text-lg uppercase tracking-wide text-fg">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg/60">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Contact />
    </main>
  );
}
