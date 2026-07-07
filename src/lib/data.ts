import { img } from "./utils";

export const COMPANY = {
  name: "Mehtab Electronics",
  tagline: "Solar Power. Trusted Security.",
  phone: "+92 300 1234567",
  phoneHref: "tel:+923001234567",
  whatsapp: "+92 321 7654321",
  email: "hello@mehtabelectronics.pk",
  address: "Plot 12, Hall Road Electronics Market, Lahore, Punjab, Pakistan",
  hours: "Mon–Sat · 9:00 AM – 8:00 PM",
  founded: 2009,
  stats: [
    { value: "4,200+", label: "Installations delivered" },
    { value: "15 yrs", label: "Field experience" },
    { value: "18 MW", label: "Solar capacity deployed" },
    { value: "99.2%", label: "Uptime on AMC clients" },
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
  { key: "solar", title: "Solar Panel Installation", blurb: "Tier-1 mono-PERC panels sized and mounted for maximum roof yield.", icon: "SunMedium", accent: "solar", span: "tall", image: img("photo-1509391366360-2e959784a276", 1200) },
  { key: "hybrid", title: "On-Grid & Hybrid Solar", blurb: "Complete solar setups with net-metering documentation handled for you.", icon: "Zap", accent: "energy", span: "wide", image: img("photo-1466611653911-95081537e5b7", 1400) },
  { key: "inverters", title: "Solar Inverters", blurb: "Hybrid and on-grid inverters with MPPT charge control and remote monitoring.", icon: "Waves", accent: "electric" },
  { key: "cctv", title: "CCTV Installation", blurb: "4K IP camera systems with night vision, NVR recording and mobile viewing.", icon: "Cctv", accent: "cyan", span: "wide", image: img("photo-1557597774-9d273605dfa9", 1400) },
  { key: "security", title: "Security Camera Systems", blurb: "Indoor and outdoor cameras with AI detection and professional cabling.", icon: "ShieldCheck", accent: "electric" },
  { key: "amc", title: "Maintenance & Support", blurb: "Scheduled health checks and priority callouts for solar and CCTV systems.", icon: "Wrench", accent: "cyan" },
];

export const SCENES = [
  { id: 1, eyebrow: "01 · Survey", title: "Designed for your roof", body: "We map your load, roof angles and sun path before a single panel is mounted." },
  { id: 2, eyebrow: "02 · Harvest", title: "Sunlight becomes power", body: "Tier-1 solar panels convert daylight into clean energy for your home or business." },
  { id: 3, eyebrow: "03 · Conversion", title: "Inverters that deliver", body: "Hybrid inverters turn DC solar power into stable AC — sized precisely to your setup." },
  { id: 4, eyebrow: "04 · Vision", title: "Eyes that never blink", body: "4K security cameras cover every entry point — live on your phone, day and night." },
];

export const PROJECTS = [
  { title: "DHA Phase 6 Residence", type: "8kW on-grid solar + inverter setup", image: img("photo-1512917774080-9991f1c4c750", 1400), tag: "Solar" },
  { title: "Gulberg Corporate Tower", type: "64-camera CCTV grid with NVR", image: img("photo-1497366811353-6870744d04b2", 1400), tag: "Security" },
  { title: "Bahria Town Solar Farm", type: "480kW on-grid net-metered array", image: img("photo-1466611653911-95081537e5b7", 1400), tag: "Solar" },
  { title: "Model Town Residence", type: "12-camera 4K security package", image: img("photo-1600607687939-ce8a6c25118c", 1400), tag: "Security" },
  { title: "Johar Town Retail Chain", type: "Hybrid solar across 3 outlets", image: img("photo-1504384308090-c894fdcc538d", 1400), tag: "Solar" },
  { title: "Lake City Farmhouse", type: "Perimeter CCTV + 6kW solar", image: img("photo-1600585154340-be6161a56a0c", 1400), tag: "Security" },
];

export const BEFORE_AFTER = [
  { label: "Rooftop → Solar Array", before: img("photo-1558618666-fcd25c85cd64", 1200), after: img("photo-1509391366360-2e959784a276", 1200) },
  { label: "Bare Wall → Monitored Perimeter", before: img("photo-1497366216548-37526070297c", 1200), after: img("photo-1557597774-9d273605dfa9", 1200) },
];

export const TECH = [
  { name: "AI Video Analytics", desc: "On-device person/vehicle detection filters false alarms before they reach you.", icon: "ScanEye" },
  { name: "MPPT Solar Tracking", desc: "Maximum power-point tracking squeezes up to 30% more yield from every panel.", icon: "SunMedium" },
  { name: "Net Metering", desc: "Sell surplus generation back to the grid with fully compliant bi-directional metering.", icon: "Gauge" },
  { name: "4K Night Vision", desc: "Full-colour and infrared imaging keeps your property visible around the clock.", icon: "Cctv" },
];

export const TESTIMONIALS = [
  { quote: "Our electricity bill dropped 70% after the hybrid solar install, and the monitoring app is genuinely beautiful. This felt like buying an Apple product, not a solar system.", name: "Ayesha Khan", role: "Homeowner · DHA Lahore" },
  { quote: "64 cameras installed across our building with clean cabling and a simple mobile app. False alerts dropped to almost zero with the AI detection.", name: "Bilal Ahmed", role: "Facilities Director · Gulberg" },
  { quote: "The AMC team is proactive — they call us before something fails. Uptime has been effectively perfect for two years.", name: "Sana Malik", role: "Operations Lead · Retail Chain" },
  { quote: "From the site survey to the final walkthrough, everything felt engineered and premium. Best contractor decision we made.", name: "Usman Tariq", role: "Farmhouse Owner · Lake City" },
];

export const FAQS = [
  { q: "Do you handle net-metering approvals?", a: "Yes. We manage the full net-metering application, LESCO/IESCO documentation and bi-directional meter installation end to end." },
  { q: "What warranty do you provide?", a: "Panels carry 25-year performance warranties, inverters 5–10 years, and our workmanship is covered for 24 months on every install." },
  { q: "What types of cameras do you install?", a: "We install 4K IP dome, bullet and PTZ cameras from Hikvision and Dahua — with NVR recording, mobile app access and professional cabling." },
  { q: "How long does a typical installation take?", a: "A residential solar setup is usually commissioned in 3–5 working days after the site survey. CCTV packages are typically completed in 1–2 days." },
  { q: "Do you offer financing?", a: "Yes — we partner with several banks for solar financing and offer flexible installment plans on complete solar packages." },
  { q: "Is there ongoing support after installation?", a: "Every install includes 60 days of complimentary support. Our maintenance contracts add priority callouts and scheduled health checks." },
];

export const PROCESS = [
  { step: "01", title: "Site Survey", body: "Our engineers visit, map loads, roof angles and coverage gaps, then model the ideal system.", icon: "MapPin" },
  { step: "02", title: "System Design", body: "You receive a 3D layout, exact bill of materials, generation forecast and a fixed quote.", icon: "PencilRuler" },
  { step: "03", title: "Precision Install", body: "Certified crews install and commission with clean cabling, safety compliance and testing.", icon: "Wrench" },
  { step: "04", title: "Live Monitoring", body: "Everything connects to one app. We watch performance and pre-empt issues under your AMC.", icon: "Activity" },
];

export const IMPACT = [
  { value: 18, suffix: " MW", label: "Solar deployed", icon: "SunMedium" },
  { value: 4200, suffix: "+", label: "Systems installed", icon: "CheckCircle2" },
  { value: 26000, suffix: " t", label: "CO₂ avoided / year", icon: "Leaf" },
  { value: 99, suffix: ".2%", label: "AMC uptime", icon: "Activity" },
];

export const TEAM = [
  { name: "Imran Mehtab", role: "Founder & Chief Engineer", image: img("photo-1633332755192-727a05c4013d", 800), focus: "Power systems" },
  { name: "Hassan Raza", role: "Head of Solar", image: img("photo-1600486913747-55e5470d6f40", 800), focus: "PV & inverters" },
  { name: "Fatima Noor", role: "Security Systems Lead", image: img("photo-1573496359142-b8d87734a5a2", 800), focus: "CCTV & install" },
  { name: "Ahmed Sheikh", role: "Installations Manager", image: img("photo-1560250097-0b93528c311a", 800), focus: "Site commissioning" },
];

export const PACKAGES = [
  {
    name: "Solar Starter", tag: "Most popular", accent: "solar", featured: true,
    price: "from PKR 1.2M", blurb: "Complete on-grid solar with panels and inverter.",
    features: ["Tier-1 mono-PERC panels", "Hybrid inverter with MPPT", "Net-metering handled for you", "Professional roof mounting", "5-yr workmanship warranty"],
  },
  {
    name: "Security Essentials", tag: "Best value", accent: "cyan",
    price: "from PKR 185k", blurb: "Professional CCTV for home or small business.",
    features: ["4–8 × 4K AI cameras", "NVR with mobile app", "Night vision + motion alerts", "Cabling & install included", "60-day support"],
  },
  {
    name: "Solar + Security", tag: "Bundle", accent: "electric",
    price: "custom", blurb: "Power your property and protect it — one team, one quote.",
    features: ["Custom solar array sizing", "Hybrid inverter setup", "Multi-camera CCTV grid", "Single site survey", "Priority maintenance"],
  },
];

// Reusable cinematic mini-scenes (for scene-strip sections across pages)
export const SCENE_STRIPS = [
  { eyebrow: "Signal", title: "Every corner, covered", body: "Overlapping camera fields eliminate blind spots — mapped before a single bracket is drilled.", image: img("photo-1551808525-51a94da548ce", 1400), accent: "cyan" },
  { eyebrow: "Sunlight", title: "Peak-hour harvesting", body: "Panels angled to your latitude capture the most energy exactly when you use it most.", image: img("photo-1613665813446-82a78c468a1d", 1400), accent: "solar" },
  { eyebrow: "Conversion", title: "Clean, stable power", body: "Hybrid inverters sized to your array deliver reliable AC output with remote monitoring.", image: img("photo-1581092160562-40aa08e78837", 1400), accent: "energy" },
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
};

export const PRODUCT_CATEGORIES = [
  "All", "Solar Panels", "Inverters", "Security Cameras", "CCTV Packages", "Accessories",
];

export const PRODUCTS: Product[] = [
  { id: "sp-555", name: "Canadian 555W Mono-PERC", category: "Solar Panels", model: "CS7L-555MS", description: "Tier-1 half-cut mono-PERC module with 21.3% efficiency and 25-year performance warranty.", specs: ["555W peak", "21.3% eff.", "Half-cut mono", "25-yr warranty"], image: img("photo-1509391366360-2e959784a276", 1000), badge: "Tier-1" },
  { id: "sp-580", name: "JA Solar 580W Bifacial", category: "Solar Panels", model: "JAM72D40-580", description: "Bifacial dual-glass panel harvesting rear-side light for up to 20% extra yield.", specs: ["580W peak", "Bifacial", "Dual-glass", "30-yr warranty"], image: img("photo-1466611653911-95081537e5b7", 1000) },
  { id: "inv-10k", name: "Solis 10kW Hybrid Inverter", category: "Inverters", model: "S6-EH3P10K", description: "Three-phase hybrid inverter with dual MPPT, battery-ready and net-metering compliant.", specs: ["10kW", "Dual MPPT", "Hybrid", "WiFi monitor"], image: img("photo-1581092160562-40aa08e78837", 1000), badge: "Best seller" },
  { id: "inv-6k", name: "Growatt 6kW MPPT", category: "Inverters", model: "SPF 6000 ES", description: "Pure sine-wave hybrid inverter with high-voltage MPPT and parallel support.", specs: ["6kW", "Pure sine", "80A MPPT", "Parallel-ready"], image: img("photo-1497440001374-f26997328c1b", 1000) },
  { id: "cam-4k", name: "Hikvision 4K ColorVu Dome", category: "Security Cameras", model: "DS-2CD2387G2", description: "8MP full-colour night vision dome with AcuSense person/vehicle detection.", specs: ["8MP / 4K", "ColorVu night", "AcuSense AI", "IP67"], image: img("photo-1557597774-9d273605dfa9", 1000), badge: "AI" },
  { id: "cam-ptz", name: "Dahua 4MP PTZ Auto-Track", category: "Security Cameras", model: "SD49425XB", description: "25× optical zoom PTZ with intelligent auto-tracking and 100m IR.", specs: ["4MP", "25× zoom", "Auto-track", "100m IR"], image: img("photo-1551808525-51a94da548ce", 1000) },
  { id: "cctv-8", name: "8-Camera 4K CCTV Package", category: "CCTV Packages", model: "ME-CCTV-8", description: "Complete 8× 4K camera kit with 8-channel NVR, 4TB storage, cabling and install.", specs: ["8 × 4K cams", "8CH NVR", "4TB storage", "Install incl."], image: img("photo-1590494165264-1ebe3602eb80", 1000), badge: "Package" },
  { id: "cctv-16", name: "16-Camera Business Grid", category: "CCTV Packages", model: "ME-CCTV-16", description: "Enterprise 16-camera grid with NVR, cloud backup and mobile app.", specs: ["16 cams", "Dual NVR", "Cloud backup", "Mobile app"], image: img("photo-1521791136064-7986c2920216", 1000) },
  { id: "acc-rail", name: "Solar Mounting Rail Kit", category: "Accessories", model: "ME-RAIL-STD", description: "Anodised aluminium roof mounting rails, clamps and grounding for solar arrays.", specs: ["Anodised alu", "Wind-rated", "Grounding", "Universal"], image: img("photo-1613665813446-82a78c468a1d", 1000) },
];

export const BENEFITS = [
  { icon: "BadgeCheck", title: "Certified engineers", body: "Every install designed and commissioned by qualified engineers — not subcontracted guesswork." },
  { icon: "Wallet", title: "Transparent pricing", body: "Fixed, itemised quotes after a free survey. No surprises, no hidden line items." },
  { icon: "ShieldCheck", title: "Real warranties", body: "Manufacturer + workmanship warranties, honoured locally with priority callouts." },
  { icon: "Headphones", title: "One support line", body: "Solar and security — one team, one number, full accountability." },
  { icon: "Gauge", title: "Live monitoring", body: "Track solar generation and camera feeds from your phone, anywhere." },
  { icon: "Truck", title: "Nationwide reach", body: "Installations and maintenance across major cities, with stocked genuine parts." },
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

export const BRANDS = ["Canadian Solar", "JA Solar", "Solis", "Growatt", "Hikvision", "Dahua"];

export const VALUES = [
  { icon: "Compass", title: "Engineering-first", body: "We solve for physics and load before aesthetics. It just happens to look beautiful too." },
  { icon: "HeartHandshake", title: "Radical accountability", body: "One partner for the whole system means there's never anyone else to blame — only us to trust." },
  { icon: "Leaf", title: "Clean by default", body: "Energy independence and lower bills are the baseline of every design, not a premium extra." },
  { icon: "Sparkles", title: "Obsessive craft", body: "Clean cabling, labelled panels, tidy conduits — the details you'll never see are the ones we sweat." },
];

export const TIMELINE = [
  { year: "2009", title: "Founded in Lahore", body: "Started as a specialist CCTV and electronics installer on Hall Road." },
  { year: "2013", title: "Into solar", body: "Added solar panel and inverter installation as energy costs climbed." },
  { year: "2018", title: "Hybrid systems", body: "Launched on-grid and hybrid solar setups with full net-metering support." },
  { year: "2021", title: "18 MW milestone", body: "Crossed 18 MW of solar deployed and 4,000+ total installations nationwide." },
  { year: "2025", title: "Solar + security focus", body: "Dedicated to two core services: solar power systems and professional CCTV installation." },
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
  { key: "board", title: "Motherboard", description: "The digital brain coordinating every subsystem in real time.", benefits: "Instant fault detection & self-protection", spec: "32-bit DSP · 50µs response", icon: "CircuitBoard" },
  { key: "fans", title: "Cooling Fans", description: "Temperature-controlled fans keep the unit cool under full load.", benefits: "Silent, longer component life", spec: "Dual PWM · <35 dB", icon: "Fan" },
  { key: "coil", title: "Copper Coil", description: "High-purity copper windings for efficient energy transfer.", benefits: "Lower losses, higher yield", spec: "99.9% Cu · low-EMI", icon: "Cable" },
  { key: "transformer", title: "Transformer", description: "Steps voltage precisely between DC and AC domains.", benefits: "Clean, stable output", spec: "Toroidal · 98% eff.", icon: "Zap" },
  { key: "caps", title: "Capacitors", description: "Smoothing capacitors flatten ripple for pure sine output.", benefits: "Flicker-free power", spec: "Film + electrolytic", icon: "Container" },
  { key: "battery", title: "Battery Connections", description: "Smart terminals manage charge and discharge safely.", benefits: "Optimised battery life", spec: "BMS-linked · fused", icon: "Plug" },
  { key: "display", title: "Display Module", description: "Live readout of generation, load and battery health.", benefits: "See everything at a glance", spec: "Touch LCD · app sync", icon: "MonitorSmartphone" },
  { key: "heatsink", title: "Heat Sink", description: "Aluminium fins draw heat away from power stages.", benefits: "Sustained peak output", spec: "Anodised alu · finned", icon: "Thermometer" },
  { key: "wiring", title: "Internal Wiring", description: "Shielded, colour-coded harness for safe, tidy routing.", benefits: "Reliable & serviceable", spec: "Tinned Cu · shielded", icon: "Network" },
  { key: "controller", title: "Power Controller", description: "MPPT controller squeezes maximum power from every panel.", benefits: "Up to 30% more harvest", spec: "Dual MPPT · 99.5%", icon: "Cpu" },
];

// Order MUST match the interior meshes in three/CameraScene.tsx
export const CAMERA_PARTS: ExplodePart[] = [
  { key: "lens", title: "Lens Elements", description: "Multi-coated glass stack focuses light with clarity.", benefits: "Sharp, distortion-free image", spec: "6G multi-coat · f/1.6", icon: "Aperture" },
  { key: "cmos", title: "CMOS Sensor", description: "Large back-lit sensor captures crisp detail in any light.", benefits: "4K clarity, low noise", spec: '1/1.8" · 8MP BSI', icon: "SquareStack" },
  { key: "ir", title: "Infrared LEDs", description: "IR array lights the scene invisibly for night vision.", benefits: "See in total darkness", spec: "850nm · 30m range", icon: "Lightbulb" },
  { key: "ai", title: "AI Chip", description: "On-device neural engine detects people and vehicles.", benefits: "Near-zero false alarms", spec: "2 TOPS NPU", icon: "BrainCircuit" },
  { key: "night", title: "Night Vision Module", description: "Fuses colour and IR for full-colour night imaging.", benefits: "Colour footage 24/7", spec: "ColorVu · F1.0", icon: "Moon" },
  { key: "mic", title: "Microphone", description: "Built-in mic captures clear two-way audio.", benefits: "Talk & listen live", spec: "-38 dB · noise-cancel", icon: "Mic" },
  { key: "speaker", title: "Speaker", description: "Integrated speaker for warnings and intercom.", benefits: "Deter intruders instantly", spec: "1W · full-duplex", icon: "Volume2" },
  { key: "heatsink", title: "Heat Sink", description: "Passive cooling keeps the sensor stable and quiet.", benefits: "Consistent image quality", spec: "Alloy · fanless", icon: "Thermometer" },
  { key: "wifi", title: "Wireless Module", description: "Dual-band WiFi streams encrypted footage reliably.", benefits: "Wire-free installs", spec: "WiFi 6 · WPA3", icon: "Wifi" },
  { key: "power", title: "Power Circuit", description: "PoE / DC circuit delivers clean, protected power.", benefits: "Surge-safe, single cable", spec: "PoE 802.3af", icon: "Zap" },
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
  img("photo-1555617981-dac3880eac6e", 600),    // heat sink / cooling
  img("photo-1544197150-b99a580bb7a8", 600),    // internal wiring / cables
  img("photo-1517430816045-df4b7de11d1d", 600), // power controller / chip
];

export const CAMERA_PART_IMAGES = [
  img("photo-1516035069371-29a1b244cc32", 600), // lens elements
  img("photo-1519638399535-1b036603ac77", 600), // CMOS sensor / electronics
  img("photo-1550751827-4bd374c3f58b", 600),    // IR LEDs / tech
  img("photo-1518770660439-4636190af475", 600), // AI chip / board
  img("photo-1526374965328-7f61d4dc18c5", 600),  // night vision / matrix
  img("photo-1590602847861-f357a9332bbc", 600),  // microphone
  img("photo-1545454675-3531b543be5d", 600),      // speaker
  img("photo-1555617981-dac3880eac6e", 600),      // heat sink
  img("photo-1544197150-b99a580bb7a8", 600),      // wireless module
  img("photo-1581092160562-40aa08e78837", 600),  // power circuit
];
