import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import PublicChrome from "@/components/providers/PublicChrome";
import JsonLd from "@/components/seo/JsonLd";

import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mehtab Electronics  Solar & Security Systems | Narowal, Punjab",
    template: "%s | Mehtab Electronics",
  },
  description:
    "Solar system installation, CCTV networks and wholesale supply  trusted by homeowners, farmers and businesses across Punjab. Based in Narowal since 1996, serving all Punjab.",
  applicationName: "Mehtab Electronics",
  keywords: [
    "solar installation Narowal",
    "CCTV installation Punjab",
    "solar wholesale dealer",
    "hybrid solar systems",
    "inverters",
    "batteries",
    "security cameras",
    "Longi JinKO Solis Inverex Hikvision",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Mehtab Electronics  Solar & Security Systems",
    description:
      "Solar installation, inverters, batteries and CCTV  professionally installed across Punjab since 1996.",
    url: SITE_URL,
    siteName: "Mehtab Electronics",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehtab Electronics  Solar & Security Systems",
    description:
      "Solar, inverters, batteries and CCTV  installed across Punjab since 1996.",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var s=localStorage.getItem('theme');var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <JsonLd />
        <ThemeProvider>
          <PublicChrome>{children}</PublicChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
