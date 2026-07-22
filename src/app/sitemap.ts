import type { MetadataRoute } from "next";
import { SITE_URL, flattenSiteMap } from "@/lib/site";

/**
 * XML sitemap for search engines. Ordered like the site: home first, then each
 * main section immediately followed by its sub-pages. (XML sitemaps are a flat
 * list by spec  the human sitemap page at /sitemap shows the nested view.)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return flattenSiteMap().map((n) => ({
    url: `${SITE_URL}${n.href === "/" ? "" : n.href}`,
    lastModified: now,
    changeFrequency: n.changeFrequency ?? "monthly",
    priority: n.priority ?? 0.6,
  }));
}
