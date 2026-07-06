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
    eyebrow: "01 · Vision & Security",
    title: <>CCTV that <span className="text-gradient">actually watches</span>.</>,
    body: "Beyond recording — our AI camera systems recognise people and vehicles, ignore false alarms, and stream 4K to your phone with encrypted cloud backup.",
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
    eyebrow: "02 · Solar & Storage",
    title: <>Turn your roof into a <span className="text-gradient-solar">power plant</span>.</>,
    body: "Tier-1 mono-PERC panels, hybrid inverters and lithium storage — sized precisely to your load so you generate, store and sell energy on your terms.",
    points: [
      { icon: "SunMedium", text: "Tier-1 mono-PERC, 25-yr warranty" },
      { icon: "Zap", text: "Hybrid & on-grid, net-metering ready" },
      { icon: "BatteryCharging", text: "Lithium storage with smart BMS" },
      { icon: "Gauge", text: "Live generation & savings dashboard" },
    ],
    image: img("photo-1509391366360-2e959784a276", 1400),
    reverse: true,
    accent: "text-solar",
    cta: "Estimate my savings",
  },
  {
    id: "inverters",
    eyebrow: "03 · Power Electronics",
    title: <>Flawless power, <span className="text-gradient">zero flicker</span>.</>,
    body: "Pure sine-wave inverters, online UPS and deep-cycle batteries keep critical loads running through any outage — instantly and silently.",
    points: [
      { icon: "Waves", text: "Pure sine-wave, high-frequency inverters" },
      { icon: "BatteryFull", text: "Lithium & tubular battery banks" },
      { icon: "Activity", text: "MPPT charging & load management" },
      { icon: "ShieldCheck", text: "Surge, overload & deep-discharge protection" },
    ],
    image: img("photo-1581092160562-40aa08e78837", 1400),
    accent: "text-electric",
  },
  {
    id: "smart-home",
    eyebrow: "04 · Automation",
    title: <>A home that <span className="text-gradient">responds to you</span>.</>,
    body: "Lighting, climate, blinds, locks and scenes — controlled by voice, app or a single tap. Your whole environment, orchestrated intelligently.",
    points: [
      { icon: "House", text: "Voice, app & scene-based control" },
      { icon: "Lightbulb", text: "Adaptive lighting & climate" },
      { icon: "Lock", text: "Smart locks & access control" },
      { icon: "Wifi", text: "Mesh WiFi 6 backbone" },
    ],
    image: img("photo-1558002038-1055907df827", 1400),
    reverse: true,
    accent: "text-cyan",
    cta: "Design my smart home",
  },
];
