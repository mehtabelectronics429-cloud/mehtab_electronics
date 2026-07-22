import { ClipboardCheck, Wrench, Smartphone } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/ui/Reveal";
import { STOCK } from "@/lib/assets";

const STEPS = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Free survey & design",
    body: "We visit, measure your load and roof, then design a right-sized system with a clear, fixed quote  no guesswork, no oversizing.",
    image: STOCK.engineerDesign,
  },
  {
    icon: Wrench,
    step: "02",
    title: "Clean, certified install",
    body: "Our own crews mount panels, wire inverters and batteries and run neat conduit  tidy work you'll be glad is behind the wall.",
    image: STOCK.solarInstaller,
  },
  {
    icon: Smartphone,
    step: "03",
    title: "Monitor from your phone",
    body: "We set up net-metering and remote monitoring so you can watch generation, backup and cameras from anywhere, anytime.",
    image: STOCK.monitoringApp,
  },
];

export default function HowWeWork() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mono-label">How we work</div>
        <h2 className="mt-4 display-lg max-w-3xl text-fg">
          Surveyed, installed & <span className="text-accent">supported</span>.
        </h2>
        <p className="lead mt-5 max-w-xl">
          One accountable team from the first site visit to years of after-sales
          support the way we&apos;ve worked across Punjab since 1996.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1}>
              <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-line/15 bg-surface/40 shadow-card transition-all hover:-translate-y-1 hover:border-brand/40">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <SmartImage
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
                  <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-md bg-brand text-on-brand shadow-glow-brand">
                    <s.icon className="h-5 w-5" strokeWidth={2.2} />
                  </span>
                  <span className="absolute right-4 top-4 font-display text-3xl text-white/85">
                    {s.step}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl uppercase tracking-wide text-fg">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg/60">
                    {s.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
