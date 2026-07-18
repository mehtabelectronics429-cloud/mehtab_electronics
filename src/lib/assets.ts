/**
 * Real Mehtab Electronics site photography (installed jobs), stored in
 * /public/images/site. Categorised for use across the marketing pages.
 * These are the company's actual installations — prefer them over stock.
 */

const P = "/images/site";

export const LOGO_MARK = `${P}/logo-mark.png`;
/** Wide branded promo banner (Solar EPC + Security Division), text baked in. */
export const SECURITY_BANNER = "/images/security-division-banner.png";

/** Rooftop / ground solar-panel installations. */
export const SOLAR_PANELS = [
  `${P}/solar-3.jpg`,
  `${P}/solar-5.jpg`,
  `${P}/solar-10.jpg`,
  `${P}/solar-8.jpg`,
  `${P}/solar-7.jpg`,
  `${P}/solar-4.jpg`,
  `${P}/solar-9.jpg`,
  `${P}/solar-17.jpg`,
  `${P}/solar-6.jpg`,
  `${P}/solar-18.jpg`,
];

/** Wall-mounted inverters + distribution boards (installed). */
export const INVERTERS = [
  `${P}/solar-13.jpg`,
  `${P}/solar-20.jpg`,
  `${P}/solar-14.jpg`,
  `${P}/solar-2.jpg`,
  `${P}/solar-19.jpg`,
  `${P}/solar-12.jpg`,
  `${P}/solar-11.jpg`,
  `${P}/solar-16.jpg`,
];

/** Battery banks / backup (visible in these installs). */
export const BATTERIES = [
  `${P}/solar-11.jpg`,
  `${P}/solar-15.jpg`,
  `${P}/solar-16.jpg`,
  `${P}/solar-1.jpg`,
];

/** CCTV camera. */
export const CAMERA = `${P}/camera.jpg`;
export const CAMERAS = [`${P}/camera.jpg`];

/** Everything, for galleries. */
export const ALL_SOLAR = [...SOLAR_PANELS, ...INVERTERS];

/** Authorized-partner / supplier brand logos (real marks) for the logo marquee. */
export const PARTNER_LOGOS = [
  { name: "Inverex", role: "Authorized Solar Partner", src: "/images/logos/inverex.png" },
  { name: "Solis", role: "Authorized Inverter Dealer", src: "/images/logos/solis.png" },
  { name: "itel", role: "Authorized Dealer", src: "/images/logos/itel.svg" },
  { name: "LONGi", role: "Trusted Supplier", src: "/images/logos/longi.png" },
  { name: "JinKO Solar", role: "Trusted Supplier", src: "/images/logos/jinko.png" },
  { name: "Hikvision", role: "CCTV Partner", src: "/images/logos/hikvision.png" },
];

/** Hand-picked heroes. */
export const HERO_IMAGE = `${P}/solar-3.jpg`;
export const HERO_SOLAR = `${P}/solar-5.jpg`;
export const HERO_INVERTER = `${P}/solar-13.jpg`;
export const HERO_CCTV = `${P}/camera.jpg`;

/**
 * Licence-safe stock imagery (Unsplash) used to enrich sections where we don't
 * have a matching field photo. Kept in /public/images/stock.
 */
const S = "/images/stock";
export const STOCK = {
  solarRooftop: `${S}/solar-rooftop.jpg`,
  solarPanels: `${S}/solar-panels.jpg`,
  solarArray: `${S}/solar-array.jpg`,
  solarAerial: `${S}/solar-aerial.jpg`,
  solarInstaller: `${S}/solar-installer.jpg`,
  cleanEnergy: `${S}/clean-energy.jpg`,
  engineerDesign: `${S}/engineer-design.jpg`,
  smartApp: `${S}/smart-app.jpg`,
  monitoringApp: `${S}/monitoring-app.jpg`,
  cctvGrid: `${S}/cctv-grid.jpg`,
  handshake: `${S}/handshake.jpg`,
  solarGround: `${S}/solar-ground.jpg`,
  wiring: `${S}/wiring.jpg`,
};
