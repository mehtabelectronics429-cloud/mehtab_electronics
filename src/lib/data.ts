import { img } from "./utils";
import { SOLAR_PANELS, INVERTERS, BATTERIES, CAMERA } from "./assets";

// Real team photos (served from /public/images).
const MudassarImg = "/images/owner-CBotE3wE.jpeg";
const AhmedImg = "/images/engineer-CbB93VlF.jpeg";
const RashidImg = "/images/sitemanager-orVb5tUt.jpeg";
const QasimImg = "/images/labour-r3YHRwh-.jpeg";

export const COMPANY = {
  name: "Mehtab Electronics",
  tagline: "Power your home. Protect what matters.",
  region: "Narowal · Serving all Punjab",
  phone: "0303 7777921",
  phoneHref: "tel:+923037777921",
  whatsapp: "+92 303 7777921",
  email: "info@mehtabelectronics.com",
  address: "Mehtab Electronics, Narowal, Punjab, Pakistan",
  hours: "Mon–Sat · 9:00 AM – 8:00 PM",
  mapEmbed:
    // "https://www.google.com/maps?q=Narowal,Punjab,Pakistan&output=embed",
    " https://maps.app.goo.gl/JEUj4rBGYHmtRXu1A?g_st=iwb",
  founded: 1996,
  // The two people who run the shop (shown in the contact section)
  contacts: [
    {
      name: "Mudassar Sherazi",
      phone: "0303 7777921",
      phoneHref: "tel:+923037777921",
    },
    { name: "M. Qasim", phone: "0313 7777921", phoneHref: "tel:+923137777921" },
  ],
  stats: [
    { value: "500+", label: "Systems Installed" },
    { value: "1000+", label: "Happy Clients" },
    { value: "30+", label: "Years Experience" },
    { value: "All", label: "Punjab Coverage" },
  ],
};

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Solar", href: "/solar" },
  { label: "Security", href: "/security" },
  { label: "Contact", href: "#contact" },
];

export type Service = {
  key: string;
  title: string;
  blurb: string;
  icon: string; // lucide icon name
  accent: "electric" | "cyan" | "solar" | "energy";
  span?: "wide" | "tall" | "normal";
  image?: string;
};

export const SERVICES: Service[] = [
  {
    key: "solar",
    title: "Solar Panel Installation",
    blurb: "Tier-1 mono-PERC panels sized and mounted for maximum roof yield.",
    icon: "SunMedium",
    accent: "solar",
    span: "tall",
    image: img("photo-1509391366360-2e959784a276", 1200),
  },
  {
    key: "hybrid",
    title: "On-Grid & Hybrid Solar",
    blurb:
      "Complete solar setups with net-metering documentation handled for you.",
    icon: "Zap",
    accent: "energy",
    span: "wide",
    image: img("photo-1466611653911-95081537e5b7", 1400),
  },
  {
    key: "inverters",
    title: "Solar Inverters",
    blurb:
      "Hybrid and on-grid inverters with MPPT charge control and remote monitoring.",
    icon: "Waves",
    accent: "electric",
  },
  {
    key: "cctv",
    title: "CCTV Installation",
    blurb:
      "4K IP camera systems with night vision, NVR recording and mobile viewing.",
    icon: "Cctv",
    accent: "cyan",
    span: "wide",
    image: img("photo-1557597774-9d273605dfa9", 1400),
  },
  {
    key: "security",
    title: "Security Camera Systems",
    blurb:
      "Indoor and outdoor cameras with AI detection and professional cabling.",
    icon: "ShieldCheck",
    accent: "electric",
  },
  {
    key: "amc",
    title: "Maintenance & Support",
    blurb:
      "Scheduled health checks and priority callouts for solar and CCTV systems.",
    icon: "Wrench",
    accent: "cyan",
  },
];

export const SCENES = [
  {
    id: 1,
    eyebrow: "01 · Survey",
    title: "Designed for your roof",
    body: "We map your load, roof angles and sun path before a single panel is mounted.",
  },
  {
    id: 2,
    eyebrow: "02 · Harvest",
    title: "Sunlight becomes power",
    body: "Tier-1 solar panels convert daylight into clean energy for your home or business.",
  },
  {
    id: 3,
    eyebrow: "03 · Conversion",
    title: "Inverters that deliver",
    body: "Hybrid inverters turn DC solar power into stable AC  sized precisely to your setup.",
  },
  {
    id: 4,
    eyebrow: "04 · Vision",
    title: "Eyes that never blink",
    body: "4K security cameras cover every entry point  live on your phone, day and night.",
  },
];

export const PROJECTS = [
  {
    title: "10 kW Hybrid Solar",
    type: "Solar",
    location: "Residential · Narowal",
    image: SOLAR_PANELS[0],
    tag: "Solar",
  },
  {
    title: "Hybrid Inverter + DB",
    type: "Inverter",
    location: "Home · Narowal",
    image: INVERTERS[0],
    tag: "Inverter",
  },
  {
    title: "25 kW Commercial Solar",
    type: "Solar",
    location: "Shopping Plaza · Gujranwala",
    image: SOLAR_PANELS[1],
    tag: "Solar",
  },
  {
    title: "Backup Battery Bank",
    type: "Battery",
    location: "Villa · Lahore",
    image: BATTERIES[0],
    tag: "Battery",
  },
  {
    title: "5 kW Off-Grid Solar",
    type: "Solar",
    location: "Farmhouse · Pasrur",
    image: SOLAR_PANELS[2],
    tag: "Solar",
  },
  {
    title: "50 kW Solar Array",
    type: "Solar",
    location: "Industrial · Faisalabad",
    image: SOLAR_PANELS[3],
    tag: "Solar",
  },
];

/** Three headline specialties (home "what we do" grid). */
export type Specialty = {
  key: string;
  tag: string;
  title: string;
  blurb: string;
  image: string;
  features: string[];
  href: string;
  icon: string;
};

export const SPECIALTIES: Specialty[] = [
  {
    key: "solar",
    tag: "01 · Energy",
    title: "Solar System Installation",
    blurb:
      "On-grid, off-grid and hybrid solar systems  from 3 kW homes to 50 kW commercial. Designed around your load, installed clean.",
    image: SOLAR_PANELS[0],
    features: [
      "Tier-1 panels & inverters",
      "Batteries & backup ready",
      "Net-metering handled",
      "After-sales support",
    ],
    href: "/services/solar",
    icon: "SunMedium",
  },
  {
    key: "wholesale",
    tag: "02 · Supply",
    title: "Wholesale Dealer",
    blurb:
      "Authorized wholesale of solar panels, inverters, batteries and CCTV equipment. Dealer pricing for shops and installers across Punjab.",
    image: INVERTERS[0],
    features: [
      "Inverex, Solis & CNC authorized",
      "Bulk pricing available",
      "Fast dispatch",
      "Genuine warranty",
    ],
    href: "/products",
    icon: "PackageOpen",
  },
  {
    key: "cctv",
    tag: "03 · Security",
    title: "CCTV Installation",
    blurb:
      "HD & 4K IP camera networks with mobile viewing, night vision and DVR/NVR storage. Neat conduit runs, tested playback.",
    image: CAMERA,
    features: [
      "2 MP – 8 MP options",
      "Weather-sealed outdoor",
      "iOS & Android app",
      "Remote viewing setup",
    ],
    href: "/services/cctv",
    icon: "Cctv",
  },
];

/** Certified / authorized brand partners (home logo wall). */
export const PARTNERS = [
  { name: "CNC Electric", role: "Authorized Partner" },
  { name: "Inverex", role: "Authorized Solar Partner" },
  { name: "Solis", role: "Authorized Inverter Dealer" },
  { name: "itel", role: "Authorized Dealer" },
  { name: "LONGi", role: "Trusted Supplier" },
  { name: "JinKO Solar", role: "Trusted Supplier" },
  { name: "Hikvision", role: "CCTV Partner" },
];

/** Load-calculator appliance catalogue (watts, and whether it only runs briefly). */
export type Appliance = {
  name: string;
  watts: number;
  qty: number;
  shortUse?: boolean;
};

export const APPLIANCES: Appliance[] = [
  { name: "LED Bulb / Saver", watts: 15, qty: 8 },
  { name: "Ceiling Fan", watts: 80, qty: 4 },
  { name: "Pedestal Fan", watts: 100, qty: 0 },
  { name: "LED TV", watts: 100, qty: 1 },
  { name: "Refrigerator", watts: 200, qty: 1 },
  { name: "Deep Freezer", watts: 250, qty: 0 },
  { name: "AC 1.0 Ton (Inverter)", watts: 900, qty: 0 },
  { name: "AC 1.5 Ton (Inverter)", watts: 1200, qty: 1 },
  { name: "AC 2.0 Ton", watts: 1800, qty: 0 },
  { name: "Computer / Laptop", watts: 150, qty: 0 },
  { name: "Wi-Fi Router", watts: 15, qty: 0 },
  { name: "Iron", watts: 1000, qty: 1, shortUse: true },
  { name: "Water Pump / Motor", watts: 750, qty: 1, shortUse: true },
  { name: "Washing Machine", watts: 500, qty: 0, shortUse: true },
  { name: "Microwave Oven", watts: 1000, qty: 0, shortUse: true },
  { name: "Electric Kettle", watts: 1500, qty: 0, shortUse: true },
];

export const BEFORE_AFTER = [
  {
    label: "Rooftop → Solar Array",
    before: img("photo-1558618666-fcd25c85cd64", 1200),
    after: img("photo-1509391366360-2e959784a276", 1200),
  },
  {
    label: "Bare Wall → Monitored Perimeter",
    before: img("photo-1497366216548-37526070297c", 1200),
    after: img("photo-1557597774-9d273605dfa9", 1200),
  },
];

export const TECH = [
  {
    name: "AI Video Analytics",
    desc: "On-device person/vehicle detection filters false alarms before they reach you.",
    icon: "ScanEye",
  },
  {
    name: "MPPT Solar Tracking",
    desc: "Maximum power-point tracking squeezes up to 30% more yield from every panel.",
    icon: "SunMedium",
  },
  {
    name: "Net Metering",
    desc: "Sell surplus generation back to the grid with fully compliant bi-directional metering.",
    icon: "Gauge",
  },
  {
    name: "4K Night Vision",
    desc: "Full-colour and infrared imaging keeps your property visible around the clock.",
    icon: "Cctv",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "Our electricity bill dropped 70% after the hybrid solar install, and the monitoring app is genuinely beautiful. This felt like buying an Apple product, not a solar system.",
    name: "Ayesha Khan",
    role: "Homeowner · DHA Lahore",
  },
  {
    quote:
      "64 cameras installed across our building with clean cabling and a simple mobile app. False alerts dropped to almost zero with the AI detection.",
    name: "Bilal Ahmed",
    role: "Facilities Director · Gulberg",
  },
  {
    quote:
      "The AMC team is proactive  they call us before something fails. Uptime has been effectively perfect for two years.",
    name: "Sana Malik",
    role: "Operations Lead · Retail Chain",
  },
  {
    quote:
      "From the site survey to the final walkthrough, everything felt engineered and premium. Best contractor decision we made.",
    name: "Usman Tariq",
    role: "Farmhouse Owner · Lake City",
  },
];

export const FAQS = [
  {
    q: "Do you handle net-metering approvals?",
    a: "Yes. We manage the full net-metering application, LESCO/IESCO documentation and bi-directional meter installation end to end.",
  },
  {
    q: "What warranty do you provide?",
    a: "Panels carry 25-year performance warranties, inverters 5–10 years, and our workmanship is covered for 24 months on every install.",
  },
  {
    q: "What types of cameras do you install?",
    a: "We install 4K IP dome, bullet and PTZ cameras from Hikvision and Dahua  with NVR recording, mobile app access and professional cabling.",
  },
  {
    q: "How long does a typical installation take?",
    a: "A residential solar setup is usually commissioned in 3–5 working days after the site survey. CCTV packages are typically completed in 1–2 days.",
  },
  {
    q: "Do you offer financing?",
    a: "Yes  we partner with several banks for solar financing and offer flexible installment plans on complete solar packages.",
  },
  {
    q: "Is there ongoing support after installation?",
    a: "Every install includes 60 days of complimentary support. Our maintenance contracts add priority callouts and scheduled health checks.",
  },
];

export const PROCESS = [
  {
    step: "01",
    title: "Site Survey",
    body: "Our engineers visit, map loads, roof angles and coverage gaps, then model the ideal system.",
    icon: "MapPin",
  },
  {
    step: "02",
    title: "System Design",
    body: "You receive a 3D layout, exact bill of materials, generation forecast and a fixed quote.",
    icon: "PencilRuler",
  },
  {
    step: "03",
    title: "Precision Install",
    body: "Certified crews install and commission with clean cabling, safety compliance and testing.",
    icon: "Wrench",
  },
  {
    step: "04",
    title: "Live Monitoring",
    body: "Everything connects to one app. We watch performance and pre-empt issues under your AMC.",
    icon: "Activity",
  },
];

export const IMPACT = [
  { value: 18, suffix: " MW", label: "Solar deployed", icon: "SunMedium" },
  {
    value: 4200,
    suffix: "+",
    label: "Systems installed",
    icon: "CheckCircle2",
  },
  { value: 26000, suffix: " t", label: "CO₂ avoided / year", icon: "Leaf" },
  { value: 99, suffix: ".2%", label: "AMC uptime", icon: "Activity" },
];

export const TEAM = [
  {
    name: "Mudassar Sherazi",
    role: "Founder & Owner",
    image: MudassarImg,
    focus: "Power systems",
    description:
      "Leads Mehtab Electronics with a vision to bring reliable solar energy and modern security to every corner of Punjab.",
  },
  {
    name: "Ahmad Faraz",
    role: "Senior Engineer",
    image: AhmedImg,
    focus: "PV & inverters",
    description:
      "Designs solar systems and oversees technical execution  from load analysis to inverter commissioning.",
  },
  {
    name: "Rashid",
    role: "Site Manager",
    image: RashidImg,
    focus: "CCTV & install",
    description:
      "Coordinates on-site teams, ensuring every installation meets our quality standards and client expectations.",
  },
  {
    name: "Ahmed Sheikh",
    role: "Labor Handler",
    image: QasimImg,
    focus: "Site commissioning",
    description:
      "Manages the workforce on-site, ensuring timely completion of installations and adherence to safety protocols.",
  },
];

export const PACKAGES = [
  {
    name: "Solar Starter",
    tag: "Most popular",
    accent: "solar",
    featured: true,
    price: "from PKR 1.2M",
    blurb: "Complete on-grid solar with panels and inverter.",
    features: [
      "Tier-1 mono-PERC panels",
      "Hybrid inverter with MPPT",
      "Net-metering handled for you",
      "Professional roof mounting",
      "5-yr workmanship warranty",
    ],
  },
  {
    name: "Security Essentials",
    tag: "Best value",
    accent: "cyan",
    price: "from PKR 185k",
    blurb: "Professional CCTV for home or small business.",
    features: [
      "4–8 × 4K AI cameras",
      "NVR with mobile app",
      "Night vision + motion alerts",
      "Cabling & install included",
      "60-day support",
    ],
  },
  {
    name: "Solar + Security",
    tag: "Bundle",
    accent: "electric",
    price: "custom",
    blurb: "Power your property and protect it  one team, one quote.",
    features: [
      "Custom solar array sizing",
      "Hybrid inverter setup",
      "Multi-camera CCTV grid",
      "Single site survey",
      "Priority maintenance",
    ],
  },
];

// Reusable cinematic mini-scenes (for scene-strip sections across pages)
export const SCENE_STRIPS = [
  {
    eyebrow: "Signal",
    title: "Every corner, covered",
    body: "Overlapping camera fields eliminate blind spots  mapped before a single bracket is drilled.",
    image: CAMERA,
    accent: "cyan",
  },
  {
    eyebrow: "Sunlight",
    title: "Peak-hour harvesting",
    body: "Panels angled to your latitude capture the most energy exactly when you use it most.",
    image: SOLAR_PANELS[4],
    accent: "solar",
  },
  {
    eyebrow: "Conversion",
    title: "Clean, stable power",
    body: "Hybrid inverters sized to your array deliver reliable AC output with remote monitoring.",
    image: INVERTERS[1],
    accent: "energy",
  },
];

export type Product = {
  id: string;
  name: string;
  category: string;
  model: string;
  price?: string;
  description: string;
  specs: string[];
  image: string;
  badge?: string;
  features?: string[];
  highlights?: string[];
};

export const PRODUCT_CATEGORIES = [
  "All",
  "Solar Panels",
  "Inverters",
  "Batteries",
  "Cameras",
];

export const PRODUCTS: Product[] = [
  {
    id: "sp-585",
    name: "Longi Hi-MO 585W Mono-PERC",
    category: "Solar Panels",
    model: "LR5-72HTH",
    description:
      "Tier-1 half-cut mono-PERC module with high efficiency and a 25-year performance warranty.",
    specs: ["585W peak", "Half-cut mono", "Tier-1", "25-yr warranty"],
    image: SOLAR_PANELS[0],
    badge: "Tier-1",
  },
  {
    id: "sp-580",
    name: "JinKO Tiger Neo 580W",
    category: "Solar Panels",
    model: "JKM580N",
    description:
      "N-type bifacial module harvesting rear-side light for up to 20% extra yield.",
    specs: ["580W peak", "N-type", "Bifacial", "30-yr warranty"],
    image: SOLAR_PANELS[1],
  },
  {
    id: "inv-inverex",
    name: "Inverex Nitrox 6kW Hybrid",
    category: "Inverters",
    model: "Nitrox 6kW",
    description:
      "Pure sine-wave hybrid inverter with dual MPPT, battery-ready and WiFi monitoring.",
    specs: ["6kW", "Dual MPPT", "Hybrid", "WiFi monitor"],
    image: INVERTERS[0],
    badge: "Best seller",
  },
  {
    id: "inv-itel",
    name: "itel 8kW Hybrid Inverter",
    category: "Inverters",
    model: "IT-8KW-H",
    description:
      "High-voltage hybrid inverter with touch display and parallel support.",
    specs: ["8kW", "Touch display", "Parallel-ready", "Battery-ready"],
    image: INVERTERS[2],
  },
  {
    id: "inv-solis",
    name: "Solis 10kW Three-Phase",
    category: "Inverters",
    model: "S6-EH3P10K",
    description:
      "Three-phase hybrid inverter, net-metering compliant with dual MPPT.",
    specs: ["10kW", "3-phase", "Dual MPPT", "Net-metering"],
    image: INVERTERS[1],
  },
  {
    id: "bat-li",
    name: "Lithium 5.1kWh Battery",
    category: "Batteries",
    model: "LFP-51",
    description:
      "LiFePO4 backup battery with BMS and long cycle life for daily solar storage.",
    specs: ["5.1 kWh", "LiFePO4", "6000+ cycles", "BMS"],
    image: BATTERIES[0],
    badge: "Popular",
  },
  {
    id: "bat-tubular",
    name: "Tubular 200Ah Battery",
    category: "Batteries",
    model: "TUB-200",
    description:
      "Deep-cycle tubular battery  reliable, economical backup for homes and shops.",
    specs: ["200 Ah", "Deep-cycle", "Tubular", "Low maintenance"],
    image: BATTERIES[1],
  },
  {
    id: "cam-2mp",
    name: "2MP HD Bullet Camera",
    category: "Cameras",
    model: "ME-B2",
    description:
      "Weather-sealed outdoor bullet camera with night vision and mobile viewing.",
    specs: ["2 MP HD", "Night vision", "IP66", "Mobile app"],
    image: CAMERA,
    badge: "In stock",
  },
  {
    id: "cam-8mp",
    name: "8MP 4K IP Dome Camera",
    category: "Cameras",
    model: "ME-D8",
    description:
      "4K IP dome with full-colour night vision, audio and person detection.",
    specs: ["8 MP / 4K", "ColorVu", "Audio", "AI detection"],
    image: CAMERA,
  },
];

export const BENEFITS = [
  {
    icon: "BadgeCheck",
    title: "Certified engineers",
    body: "Every install designed and commissioned by qualified engineers  not subcontracted guesswork.",
  },
  {
    icon: "Wallet",
    title: "Transparent pricing",
    body: "Fixed, itemised quotes after a free survey. No surprises, no hidden line items.",
  },
  {
    icon: "ShieldCheck",
    title: "Real warranties",
    body: "Manufacturer + workmanship warranties, honoured locally with priority callouts.",
  },
  {
    icon: "Headphones",
    title: "One support line",
    body: "Solar and security  one team, one number, full accountability.",
  },
  {
    icon: "Gauge",
    title: "Live monitoring",
    body: "Track solar generation and camera feeds from your phone, anywhere.",
  },
  {
    icon: "Truck",
    title: "Nationwide reach",
    body: "Installations and maintenance across major cities, with stocked genuine parts.",
  },
];

export const INDUSTRIES = [
  { icon: "Home", label: "Residential" },
  { icon: "Building2", label: "Commercial" },
  { icon: "Factory", label: "Industrial" },
  { icon: "Store", label: "Retail" },
  { icon: "Hospital", label: "Healthcare" },
  { icon: "GraduationCap", label: "Education" },
  { icon: "Warehouse", label: "Warehousing" },
  { icon: "Hotel", label: "Hospitality" },
];

export const BRANDS = [
  "CNC Electric",
  "Inverex",
  "Solis",
  "LONGi",
  "JinKO Solar",
  "Hikvision",
  "itel",
];

export const VALUES = [
  {
    icon: "Compass",
    title: "Engineering-first",
    body: "We solve for physics and load before aesthetics. It just happens to look beautiful too.",
  },
  {
    icon: "HeartHandshake",
    title: "Radical accountability",
    body: "One partner for the whole system means there's never anyone else to blame  only us to trust.",
  },
  {
    icon: "Leaf",
    title: "Clean by default",
    body: "Energy independence and lower bills are the baseline of every design, not a premium extra.",
  },
  {
    icon: "Sparkles",
    title: "Obsessive craft",
    body: "Clean cabling, labelled panels, tidy conduits  the details you'll never see are the ones we sweat.",
  },
];

export const TIMELINE = [
  {
    year: "1996",
    title: "Founded in Narowal",
    body: "Started as an electronics, telephone-exchange and electric-fence specialist serving Narowal and nearby Punjab.",
  },
  {
    year: "2008",
    title: "Into CCTV & security",
    body: "Added professional CCTV camera installation as demand for security grew across homes and businesses.",
  },
  {
    year: "2015",
    title: "Into solar",
    body: "Added solar panel and inverter installation as energy costs climbed and load-shedding worsened.",
  },
  {
    year: "2019",
    title: "Hybrid & wholesale",
    body: "Launched on-grid and hybrid solar setups with net-metering, plus wholesale supply for shops and installers.",
  },
  {
    year: "Today",
    title: "Solar · CCTV · Supply",
    body: "Trusted across Punjab for solar systems, CCTV networks and genuine wholesale equipment  since 1996.",
  },
];

export type ExplodePart = {
  key: string;
  title: string;
  description: string;
  benefits: string;
  spec: string;
  icon: string;
};

// Order MUST match the interior meshes in three/InverterScene.tsx
export const INVERTER_PARTS: ExplodePart[] = [
  {
    key: "board",
    title: "Motherboard",
    description: "The digital brain coordinating every subsystem in real time.",
    benefits: "Instant fault detection & self-protection",
    spec: "32-bit DSP · 50µs response",
    icon: "CircuitBoard",
  },
  {
    key: "fans",
    title: "Cooling Fans",
    description:
      "Temperature-controlled fans keep the unit cool under full load.",
    benefits: "Silent, longer component life",
    spec: "Dual PWM · <35 dB",
    icon: "Fan",
  },
  {
    key: "coil",
    title: "Copper Coil",
    description: "High-purity copper windings for efficient energy transfer.",
    benefits: "Lower losses, higher yield",
    spec: "99.9% Cu · low-EMI",
    icon: "Cable",
  },
  {
    key: "transformer",
    title: "Transformer",
    description: "Steps voltage precisely between DC and AC domains.",
    benefits: "Clean, stable output",
    spec: "Toroidal · 98% eff.",
    icon: "Zap",
  },
  {
    key: "caps",
    title: "Capacitors",
    description: "Smoothing capacitors flatten ripple for pure sine output.",
    benefits: "Flicker-free power",
    spec: "Film + electrolytic",
    icon: "Container",
  },
  {
    key: "battery",
    title: "Battery Connections",
    description: "Smart terminals manage charge and discharge safely.",
    benefits: "Optimised battery life",
    spec: "BMS-linked · fused",
    icon: "Plug",
  },
  {
    key: "display",
    title: "Display Module",
    description: "Live readout of generation, load and battery health.",
    benefits: "See everything at a glance",
    spec: "Touch LCD · app sync",
    icon: "MonitorSmartphone",
  },
  {
    key: "heatsink",
    title: "Heat Sink",
    description: "Aluminium fins draw heat away from power stages.",
    benefits: "Sustained peak output",
    spec: "Anodised alu · finned",
    icon: "Thermometer",
  },
  {
    key: "wiring",
    title: "Internal Wiring",
    description: "Shielded, colour-coded harness for safe, tidy routing.",
    benefits: "Reliable & serviceable",
    spec: "Tinned Cu · shielded",
    icon: "Network",
  },
  {
    key: "controller",
    title: "Power Controller",
    description: "MPPT controller squeezes maximum power from every panel.",
    benefits: "Up to 30% more harvest",
    spec: "Dual MPPT · 99.5%",
    icon: "Cpu",
  },
];

// Order MUST match the interior meshes in three/CameraScene.tsx
export const CAMERA_PARTS: ExplodePart[] = [
  {
    key: "lens",
    title: "Lens Elements",
    description: "Multi-coated glass stack focuses light with clarity.",
    benefits: "Sharp, distortion-free image",
    spec: "6G multi-coat · f/1.6",
    icon: "Aperture",
  },
  {
    key: "cmos",
    title: "CMOS Sensor",
    description: "Large back-lit sensor captures crisp detail in any light.",
    benefits: "4K clarity, low noise",
    spec: '1/1.8" · 8MP BSI',
    icon: "SquareStack",
  },
  {
    key: "ir",
    title: "Infrared LEDs",
    description: "IR array lights the scene invisibly for night vision.",
    benefits: "See in total darkness",
    spec: "850nm · 30m range",
    icon: "Lightbulb",
  },
  {
    key: "ai",
    title: "AI Chip",
    description: "On-device neural engine detects people and vehicles.",
    benefits: "Near-zero false alarms",
    spec: "2 TOPS NPU",
    icon: "BrainCircuit",
  },
  {
    key: "night",
    title: "Night Vision Module",
    description: "Fuses colour and IR for full-colour night imaging.",
    benefits: "Colour footage 24/7",
    spec: "ColorVu · F1.0",
    icon: "Moon",
  },
  {
    key: "mic",
    title: "Microphone",
    description: "Built-in mic captures clear two-way audio.",
    benefits: "Talk & listen live",
    spec: "-38 dB · noise-cancel",
    icon: "Mic",
  },
  {
    key: "speaker",
    title: "Speaker",
    description: "Integrated speaker for warnings and intercom.",
    benefits: "Deter intruders instantly",
    spec: "1W · full-duplex",
    icon: "Volume2",
  },
  {
    key: "heatsink",
    title: "Heat Sink",
    description: "Passive cooling keeps the sensor stable and quiet.",
    benefits: "Consistent image quality",
    spec: "Alloy · fanless",
    icon: "Thermometer",
  },
  {
    key: "wifi",
    title: "Wireless Module",
    description: "Dual-band WiFi streams encrypted footage reliably.",
    benefits: "Wire-free installs",
    spec: "WiFi 6 · WPA3",
    icon: "Wifi",
  },
  {
    key: "power",
    title: "Power Circuit",
    description: "PoE / DC circuit delivers clean, protected power.",
    benefits: "Surge-safe, single cable",
    spec: "PoE 802.3af",
    icon: "Zap",
  },
];

// Real photographic imagery for the exploded-view parts (index-matched to
// INVERTER_PARTS / CAMERA_PARTS). Loaded as textures onto floating cards.
export const INVERTER_IMAGE = img("photo-1581092160562-40aa08e78837", 1200);
export const CAMERA_IMAGE = img("photo-1557597774-9d273605dfa9", 1200);

export const INVERTER_PART_IMAGES = [
  img("photo-1518770660439-4636190af475", 600), // motherboard / circuit board
  img("photo-1587202372775-e229f172b9d7", 600), // cooling fans
  img("photo-1601737487795-dab272f52420", 600), // copper coil / windings
  img("photo-1581092160562-40aa08e78837", 600), // transformer / power
  img("photo-1607988795691-3d0147b43231", 600), // capacitors / electronics
  img("photo-1620714223084-8fcacc6dfd8d", 600), // battery connections
  img("photo-1587145820266-a5951ee6f620", 600), // display module / screen
  img("photo-1555617981-dac3880eac6e", 600), // heat sink / cooling
  img("photo-1544197150-b99a580bb7a8", 600), // internal wiring / cables
  img("photo-1517430816045-df4b7de11d1d", 600), // power controller / chip
];

export const CAMERA_PART_IMAGES = [
  img("photo-1516035069371-29a1b244cc32", 600), // lens elements
  img("photo-1519638399535-1b036603ac77", 600), // CMOS sensor / electronics
  img("photo-1550751827-4bd374c3f58b", 600), // IR LEDs / tech
  img("photo-1518770660439-4636190af475", 600), // AI chip / board
  img("photo-1526374965328-7f61d4dc18c5", 600), // night vision / matrix
  img("photo-1590602847861-f357a9332bbc", 600), // microphone
  img("photo-1545454675-3531b543be5d", 600), // speaker
  img("photo-1555617981-dac3880eac6e", 600), // heat sink
  img("photo-1544197150-b99a580bb7a8", 600), // wireless module
  img("photo-1581092160562-40aa08e78837", 600), // power circuit
];
