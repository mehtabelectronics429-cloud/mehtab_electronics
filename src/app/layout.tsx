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
    "Longi JinKO Solis Inverex Hikvision CNC Electric",
    "CNC Electric authorized dealer Narowal",
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
  // Phone browser bar colour; ThemeProvider keeps it in sync with the chosen
  // theme (and the admin palette) after load.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f4" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var s=localStorage.getItem('theme');var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');var a=location.pathname.indexOf('/admin')===0;var c=a?(t==='dark'?'#06070d':'#f3f5f9'):(t==='dark'?'#09090b':'#f5f5f4');document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.removeAttribute('media');m.setAttribute('content',c);});});}catch(e){document.documentElement.classList.add('dark');}})();`;

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
