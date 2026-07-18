import { SOLAR_PANELS, INVERTERS, BATTERIES, CAMERA, STOCK } from "./assets";

export type ProjectCategory = "Solar" | "Inverter" | "Battery" | "CCTV";

export type Project = {
  id: string;
  title: string;
  category: ProjectCategory;
  location: string;
  spec: string;
  year: string;
  summary: string;
  details: string[];
  images: string[]; // first image is the cover
};

/**
 * Real Mehtab installations across Punjab, grouped into projects. Each project
 * carries several of our own field photos (authentic Punjab jobs) plus the odd
 * supporting shot, so the detail popup has a real gallery to show.
 */
export const PROJECTS_DATA: Project[] = [
  {
    id: "residential-narowal-10kw",
    title: "10 kW Residential Rooftop",
    category: "Solar",
    location: "Residential · Narowal",
    spec: "10 kW · On-grid hybrid",
    year: "2024",
    summary:
      "A complete 10 kW on-grid hybrid system for a family home — Tier-1 panels, hybrid inverter and battery backup with net-metering.",
    details: [
      "18 × Longi 585W mono-PERC panels on a custom rooftop structure",
      "Inverex hybrid inverter with WiFi monitoring",
      "Lithium battery backup for essential loads",
      "Net-metering application handled end to end",
    ],
    images: [SOLAR_PANELS[0], SOLAR_PANELS[3], INVERTERS[3], BATTERIES[0]],
  },
  {
    id: "commercial-gujranwala-25kw",
    title: "25 kW Commercial Rooftop",
    category: "Solar",
    location: "Shopping Plaza · Gujranwala",
    spec: "25 kW · On-grid",
    year: "2023",
    summary:
      "A 25 kW commercial array across a shopping-plaza rooftop, cutting daytime grid costs for multiple shops.",
    details: [
      "43 × mono-PERC modules across two roof sections",
      "Three-phase on-grid inverter",
      "Clean cable management and labelled conduit",
      "Generation monitored remotely",
    ],
    images: [SOLAR_PANELS[1], SOLAR_PANELS[2], SOLAR_PANELS[4]],
  },
  {
    id: "farmhouse-pasrur-5kw",
    title: "5 kW Off-Grid Farmhouse",
    category: "Solar",
    location: "Farmhouse · Pasrur",
    spec: "5 kW · Off-grid",
    year: "2024",
    summary:
      "An off-grid 5 kW system with battery storage for a farmhouse with no reliable grid connection.",
    details: [
      "Ground-mounted panel structure",
      "Off-grid inverter sized for pumps and lighting",
      "Battery bank for full night-time autonomy",
      "Built to withstand rural dust and heat",
    ],
    images: [SOLAR_PANELS[8], SOLAR_PANELS[9], BATTERIES[3]],
  },
  {
    id: "industrial-faisalabad-50kw",
    title: "50 kW Industrial Array",
    category: "Solar",
    location: "Industrial · Faisalabad",
    spec: "50 kW · On-grid",
    year: "2023",
    summary:
      "A large 50 kW rooftop array for an industrial unit, offsetting a heavy daytime machinery load.",
    details: [
      "Rooftop structure engineered for wind load",
      "Multiple string inverters in parallel",
      "Optimised tilt for peak-hour generation",
      "Commissioned with full performance testing",
    ],
    images: [SOLAR_PANELS[5], SOLAR_PANELS[6], SOLAR_PANELS[7]],
  },
  {
    id: "hybrid-inverter-sialkot",
    title: "Hybrid Inverter Bank",
    category: "Inverter",
    location: "Home · Sialkot",
    spec: "8 kW · Hybrid",
    year: "2024",
    summary:
      "A wall of hybrid inverters and distribution boards installed and wired to a clean, serviceable standard.",
    details: [
      "Inverex hybrid inverters, parallel-ready",
      "Dedicated distribution board with breakers",
      "Surge and fire-safety protection",
      "Tidy conduit and labelled wiring",
    ],
    images: [INVERTERS[0], INVERTERS[1], INVERTERS[4]],
  },
  {
    id: "itel-inverter-narowal",
    title: "itel Hybrid Inverter + DB",
    category: "Inverter",
    location: "Home · Narowal",
    spec: "6 kW · Hybrid",
    year: "2024",
    summary:
      "An itel hybrid inverter paired with a metered distribution board — a typical clean Mehtab install.",
    details: [
      "itel Hybrid Inverter with touch display",
      "Metered DB showing live voltage",
      "WAPDA / inverter change-over wiring",
      "Mehtab after-sales support sticker on unit",
    ],
    images: [INVERTERS[2], BATTERIES[1], BATTERIES[2]],
  },
  {
    id: "battery-backup-lahore",
    title: "Battery Backup Bank",
    category: "Battery",
    location: "Villa · Lahore",
    spec: "Lithium + tubular",
    year: "2023",
    summary:
      "A backup battery bank sized to keep fans, lights and essentials running through outages.",
    details: [
      "Lithium (LiFePO4) modules with BMS",
      "Wall-mounted beside the hybrid inverter",
      "Automatic change-over on outage",
      "Monitored alongside the solar system",
    ],
    images: [BATTERIES[0], BATTERIES[1], BATTERIES[2], BATTERIES[3]],
  },
  {
    id: "cctv-network-narowal",
    title: "8-Camera CCTV Network",
    category: "CCTV",
    location: "Villa · Narowal",
    spec: "8 × cameras · NVR",
    year: "2024",
    summary:
      "A full CCTV network covering every entry point, with night vision, NVR recording and mobile viewing.",
    details: [
      "HD/4K bullet and dome cameras",
      "Weather-sealed outdoor housings",
      "NVR with local storage",
      "Remote viewing set up on iOS & Android",
    ],
    images: [CAMERA, STOCK.cctvGrid, STOCK.monitoringApp],
  },
];
