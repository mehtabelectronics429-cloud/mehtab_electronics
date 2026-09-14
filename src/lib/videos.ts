import { SOLAR_PANELS, INVERTERS, BATTERIES, CAMERA } from "./assets";

export type InstallationVideoItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  spec: string;
  summary: string;
  videoUrl: string;
  /** Optional explicit thumbnail; falls back to the YouTube thumbnail. */
  thumbnail?: string;
};

/** Extract a YouTube video id from watch / youtu.be / embed URLs. */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const rx of patterns) {
    const m = url.match(rx);
    if (m) return m[1];
  }
  return null;
}

/** Best embed URL for a given video URL (YouTube → privacy-friendly embed). */
export function embedUrl(url: string): string {
  const id = youtubeId(url);
  if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  return url;
}

/** Best available thumbnail for a video item. */
export function videoThumb(v: {
  videoUrl: string;
  thumbnail?: string;
}): string {
  if (v.thumbnail) return v.thumbnail;
  const id = youtubeId(v.videoUrl);
  if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return "";
}

/**
 * Dummy installation videos — shown until real ones are added in the admin
 * "Installation Videos" module. Thumbnails fall back to our own field photos.
 */
export const INSTALLATION_VIDEOS: InstallationVideoItem[] = [
  {
    id: "solar-10kw-lahore",
    title: "10 kW Hybrid Solar — Rooftop Install",
    category: "Solar",
    location: "Lahore",
    spec: "10 kW · Hybrid · Net-metered",
    summary:
      "Full rooftop mounting, DC/AC wiring and hybrid inverter commissioning for a family home, with battery backup and net-metering.",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    thumbnail: SOLAR_PANELS[0],
  },
  {
    id: "inverter-commissioning",
    title: "Hybrid Inverter Commissioning & App Setup",
    category: "Solar",
    location: "Gujranwala",
    spec: "8 kW · WiFi monitoring",
    summary:
      "Wall-mounting the hybrid inverter, battery connection and configuring live monitoring on the customer's phone.",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    thumbnail: INVERTERS[0],
  },
  {
    id: "battery-backup",
    title: "Lithium Battery Backup Wiring",
    category: "Battery",
    location: "Sialkot",
    spec: "10 kWh · Essential loads",
    summary:
      "Safe lithium battery installation and load-side wiring so essential circuits stay powered during outages.",
    videoUrl: "https://www.youtube.com/watch?v=hY7m5jjJ9mM",
    thumbnail: BATTERIES[0],
  },
  {
    id: "cctv-16ch",
    title: "16-Channel CCTV Network Install",
    category: "CCTV",
    location: "Narowal",
    spec: "16 × 4K cameras · NVR",
    summary:
      "Cable routing, camera mounting and NVR setup for a full-property security network with remote viewing.",
    videoUrl: "https://www.youtube.com/watch?v=fLexgOxsZu0",
    thumbnail: CAMERA,
  },
  {
    id: "solar-ground-mount",
    title: "Ground-Mount Solar Array",
    category: "Solar",
    location: "Faisalabad",
    spec: "15 kW · Ground structure",
    summary:
      "Custom ground-mount structure fabrication and panel array installation for a commercial site.",
    videoUrl: "https://www.youtube.com/watch?v=1La4QzGeaaQ",
    thumbnail: SOLAR_PANELS[1] ?? SOLAR_PANELS[0],
  },
  {
    id: "cctv-shop",
    title: "Retail Shop CCTV & Monitoring",
    category: "CCTV",
    location: "Lahore",
    spec: "8 × cameras · Mobile view",
    summary:
      "Discreet camera placement and mobile monitoring setup for a busy retail shop front and store room.",
    videoUrl: "https://www.youtube.com/watch?v=oHg5SJYRHA0",
    thumbnail: CAMERA,
  },
];
