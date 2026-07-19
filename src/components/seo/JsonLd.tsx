import { SITE_URL, SITE_MAP } from "@/lib/site";
import { COMPANY } from "@/lib/data";

/**
 * Site-wide structured data (JSON-LD). This is what lets search engines present
 * the site as a main result with sub-links ("sitelinks"): an Organization +
 * WebSite identity, plus the primary navigation as SiteNavigationElement items.
 */
export default function JsonLd() {
  const phone = COMPANY.phoneHref.replace("tel:", "");

  const nav = SITE_MAP.flatMap((n) => [n, ...(n.children ?? [])]).map((n, i) => ({
    "@type": "SiteNavigationElement",
    position: i + 1,
    name: n.label,
    url: `${SITE_URL}${n.href === "/" ? "" : n.href}`,
  }));

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": `${SITE_URL}/#organization`,
        name: COMPANY.name,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
        image: `${SITE_URL}/opengraph-image.png`,
        telephone: phone,
        email: COMPANY.email,
        foundingDate: String(COMPANY.founded),
        slogan: COMPANY.tagline,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Narowal",
          addressLocality: "Narowal",
          addressRegion: "Punjab",
          addressCountry: "PK",
        },
        areaServed: { "@type": "State", name: "Punjab, Pakistan" },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: phone,
          contactType: "sales",
          areaServed: "PK",
          availableLanguage: ["en", "ur"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: COMPANY.name,
        inLanguage: "en-PK",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      ...nav,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
