import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import PublicChrome from "@/components/providers/PublicChrome";

export const metadata: Metadata = {
  title: "Mehtab Electronics — Solar & Security Systems | Narowal, Punjab",
  description:
    "Solar system installation, CCTV networks and wholesale supply — trusted by homeowners, farmers and businesses across Punjab. Based in Narowal, serving all Punjab.",
  keywords: ["solar installation Narowal", "CCTV installation Punjab", "solar wholesale dealer", "hybrid solar systems", "inverters", "security cameras", "Longi JinKO Solis Hikvision"],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Mehtab Electronics — Solar & Security Systems",
    description: "Solar panel installation, inverters and security cameras — professionally installed across Pakistan.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var s=localStorage.getItem('theme');var t=s||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <PublicChrome>{children}</PublicChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
