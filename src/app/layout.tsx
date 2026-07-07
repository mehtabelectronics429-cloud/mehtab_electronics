import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import CursorGlow from "@/components/ui/CursorGlow";
import ScrollProgress from "@/components/ui/ScrollProgress";
import SiteBackground from "@/components/ui/SiteBackground";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Mehtab Electronics — Solar & Security Systems",
  description:
    "Mehtab Electronics installs solar panels, inverters and security cameras across Pakistan. Professional on-grid solar setups and CCTV installation.",
  keywords: ["CCTV installation Pakistan", "solar panel installation", "hybrid solar systems", "inverters", "security cameras", "solar setup Lahore"],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Mehtab Electronics — Solar & Security Systems",
    description: "Solar panel installation, inverters and security cameras — professionally installed across Pakistan.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#04060B",
  width: "device-width",
  initialScale: 1,
};

// Applies saved theme (default dark) before paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <SiteBackground />
          <ScrollProgress />
          <CursorGlow />
          <SmoothScroll>
            <Navbar />
            {children}
            <Footer />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
