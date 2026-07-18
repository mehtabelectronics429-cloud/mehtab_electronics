import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mehtabelectronics.pk";

/**
 * Sitemap grouped like a company site: the homepage at the top (priority 1.0),
 * the main sections next, then their sub-pages. Kept static so it never depends
 * on the database being reachable at build/request time.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    // Home
    { path: "/", priority: 1.0, changeFrequency: "weekly" },

    // Main sections
    { path: "/services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/products", priority: 0.9, changeFrequency: "weekly" },
    { path: "/projects", priority: 0.8, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },

    // Services sub-pages
    { path: "/services/solar", priority: 0.8, changeFrequency: "monthly" },
    { path: "/services/cctv", priority: 0.8, changeFrequency: "monthly" },

    // Product categories
    { path: "/products/solar-panels", priority: 0.7, changeFrequency: "weekly" },
    { path: "/products/inverters", priority: 0.7, changeFrequency: "weekly" },
    { path: "/products/batteries", priority: 0.7, changeFrequency: "weekly" },
    { path: "/products/cameras", priority: 0.7, changeFrequency: "weekly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
