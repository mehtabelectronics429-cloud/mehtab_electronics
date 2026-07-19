import type { Metadata } from "next";
import Link from "next/link";
import { Globe, ChevronRight } from "lucide-react";
import { SITE_URL, SITE_MAP, type SiteNode } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "Full sitemap of Mehtab Electronics — solar services, CCTV, products, projects, about and contact pages.",
  alternates: { canonical: "/sitemap" },
};

const domain = SITE_URL.replace(/^https?:\/\//, "");

function Node({ node }: { node: SiteNode }) {
  return (
    <li className="relative">
      <Link
        href={node.href}
        className="group inline-flex items-center gap-2 py-1.5 font-display text-base uppercase tracking-wide text-fg transition-colors hover:text-brand"
      >
        <ChevronRight className="h-3.5 w-3.5 text-brand" />
        {node.label}
        <span className="font-mono text-[0.6rem] normal-case tracking-normal text-fg/35 opacity-0 transition-opacity group-hover:opacity-100">
          {node.href}
        </span>
      </Link>
      {node.children && (
        <ul className="ml-4 border-l border-line/15 pl-5">
          {node.children.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="group inline-flex items-center gap-2 py-1 text-sm text-fg/70 transition-colors hover:text-brand"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand/60" />
                {c.label}
                <span className="font-mono text-[0.6rem] text-fg/30 opacity-0 transition-opacity group-hover:opacity-100">
                  {c.href}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function SitemapPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-4xl px-6 pt-36 pb-24 md:px-8">
      <div className="mono-label">Site index</div>
      <h1 className="mt-4 display-lg text-fg">Sitemap</h1>
      <p className="lead mt-4 max-w-xl">
        Every page on the Mehtab Electronics website, grouped under the main sections.
      </p>

      {/* main site link */}
      <a
        href={SITE_URL}
        className="mt-10 flex items-center gap-3 rounded-lg border border-brand/30 bg-brand/[0.06] px-5 py-4 shadow-card transition-colors hover:border-brand/60"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand text-on-brand">
          <Globe className="h-5 w-5" />
        </span>
        <div>
          <div className="mono-label !text-fg/45">Main site</div>
          <div className="font-display text-lg uppercase tracking-wide text-fg">{domain}</div>
        </div>
      </a>

      {/* nested page tree */}
      <ul className="mt-6 space-y-1 rounded-lg border border-line/15 bg-surface/40 p-5 shadow-card md:p-7">
        {SITE_MAP.map((n) => (
          <Node key={n.href} node={n} />
        ))}
      </ul>
    </main>
  );
}
