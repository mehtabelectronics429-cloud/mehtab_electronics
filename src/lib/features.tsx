import { img } from "./utils";

export type Feat = {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  points: { icon: string; text: string }[];
  image: string;
  reverse?: boolean;
  accent?: string;
  cta?: string;
};

export const FEATURES: Feat[] = [
  {
    id: "cameras",
    eyebrow: "01 · Security Cameras",
    title: (
      <>
        CCTV that <span className="text-gradient">actually watches</span>.
      </>
    ),
    body: "Our camera systems recognise people and vehicles, ignore false alarms, and stream 4K to your phone with local NVR and cloud backup.",
    points: [
      { icon: "Cctv", text: "4K IP cameras, colour night vision" },
      { icon: "ScanEye", text: "On-device AI person/vehicle detection" },
      { icon: "Cloud", text: "Encrypted cloud & local NVR backup" },
      { icon: "Smartphone", text: "Live view + alerts on any device" },
    ],
    image: img("photo-1557597774-9d273605dfa9", 1400),
    accent: "text-cyan",
  },
  {
    id: "solar",
    eyebrow: "02 · Solar Panels",
    title: (
      <>
        Turn your roof into a{" "}
        <span className="text-gradient-solar">power plant</span>.
      </>
    ),
    body: "Tier-1 mono-PERC panels and complete on-grid setups  sized precisely to your load so you generate and sell energy on your terms.",
    points: [
      { icon: "SunMedium", text: "Tier-1 mono-PERC, 25-yr warranty" },
      { icon: "Zap", text: "On-grid & hybrid, net-metering ready" },
      { icon: "Wrench", text: "Professional mounting & cabling" },
      { icon: "Gauge", text: "Live generation monitoring" },
    ],
    image: img("photo-1509391366360-2e959784a276", 1400),
    reverse: true,
    accent: "text-solar",
    cta: "Estimate my savings",
  },
  {
    id: "inverters",
    eyebrow: "03 · Solar Inverters",
    title: (
      <>
        Inverters built for <span className="text-gradient">solar setups</span>.
      </>
    ),
    body: "Hybrid and on-grid inverters with MPPT charge control  matched to your panel array for maximum efficiency and stable output.",
    points: [
      { icon: "Waves", text: "Pure sine-wave hybrid inverters" },
      { icon: "Activity", text: "Dual MPPT & load management" },
      { icon: "Smartphone", text: "WiFi monitoring app" },
      { icon: "ShieldCheck", text: "Surge & overload protection" },
    ],
    image: img("photo-1581092160562-40aa08e78837", 1400),
    accent: "text-electric",
  },
];
