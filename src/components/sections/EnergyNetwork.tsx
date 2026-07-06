"use client";

import dynamic from "next/dynamic";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";

const EnergyGlobe = dynamic(() => import("@/components/three/EnergyGlobe"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 grid place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" /></div>,
});

const NODES = [
  { icon: "Cctv", label: "Cameras" },
  { icon: "SunMedium", label: "Solar array" },
  { icon: "BatteryCharging", label: "Storage" },
  { icon: "Wifi", label: "Network" },
  { icon: "House", label: "Automation" },
  { icon: "ShieldCheck", label: "Security" },
];

export default function EnergyNetwork() {
  return (
    <section className="dark relative min-h-screen overflow-hidden bg-[radial-gradient(120%_120%_at_50%_-10%,#0b1120_0%,#04060B_60%)] py-24">
      <div className="absolute inset-0">
        <EnergyGlobe />
      </div>
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_50%_50%,transparent_40%,rgba(4,6,11,0.9)_100%)]" />

      <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-6 text-center md:px-8">
        <Reveal><span className="eyebrow">One connected ecosystem</span></Reveal>
        <Reveal delay={0.1}>
          <h2 className="display-lg mt-5 max-w-3xl text-white">
            Every device, on <span className="text-gradient">one intelligent network</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
            Cameras, solar, storage, networking and automation don&apos;t just coexist — they talk to each other, in real time, through a single secure backbone.
          </p>
        </Reveal>
        <Reveal delay={0.28}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {NODES.map((n) => (
              <span key={n.label} className="inline-flex items-center gap-2 rounded-full glass hairline px-4 py-2 text-sm text-white/80">
                <Icon name={n.icon} className="h-4 w-4 text-cyan" /> {n.label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
