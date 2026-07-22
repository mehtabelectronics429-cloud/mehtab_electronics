/** Canonical site URL  override with NEXT_PUBLIC_SITE_URL in the environment. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.mehtabelectronics.com";

export type SiteNode = {
  label: string;
  href: string;
  /** Relative importance for the XML sitemap (0–1). */
  priority?: number;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  children?: SiteNode[];
};

/**
 * The site structure  a main link with its sub-pages nested underneath.
 * Used by both the XML sitemap (flattened) and the human sitemap page (nested).
 */
export const SITE_MAP: SiteNode[] = [
  { label: "Home", href: "/", priority: 1.0, changeFrequency: "weekly" },
  {
    label: "Services",
    href: "/services",
    priority: 0.9,
    changeFrequency: "monthly",
    children: [
      {
        label: "Solar Systems",
        href: "/services/solar",
        priority: 0.8,
        changeFrequency: "monthly",
      },
      {
        label: "CCTV & Security",
        href: "/services/cctv",
        priority: 0.8,
        changeFrequency: "monthly",
      },
    ],
  },
  {
    label: "Products",
    href: "/products",
    priority: 0.9,
    changeFrequency: "weekly",
    children: [
      {
        label: "Solar Panels",
        href: "/products/solar-panels",
        priority: 0.7,
        changeFrequency: "weekly",
      },
      {
        label: "Inverters",
        href: "/products/inverters",
        priority: 0.7,
        changeFrequency: "weekly",
      },
      {
        label: "Batteries",
        href: "/products/batteries",
        priority: 0.7,
        changeFrequency: "weekly",
      },
      {
        label: "Cameras",
        href: "/products/cameras",
        priority: 0.7,
        changeFrequency: "weekly",
      },
    ],
  },
  {
    label: "Projects",
    href: "/projects",
    priority: 0.8,
    changeFrequency: "weekly",
  },
  { label: "About", href: "/about", priority: 0.7, changeFrequency: "monthly" },
  {
    label: "Contact",
    href: "/contact",
    priority: 0.7,
    changeFrequency: "monthly",
  },
];

/** Flatten the tree into a single ordered list (parents before their children). */
export function flattenSiteMap(nodes: SiteNode[] = SITE_MAP): SiteNode[] {
  const out: SiteNode[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children) out.push(...flattenSiteMap(n.children));
  }
  return out;
}
