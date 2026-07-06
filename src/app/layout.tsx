import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import CursorGlow from "@/components/ui/CursorGlow";
import ScrollProgress from "@/components/ui/ScrollProgress";
import VideoBackground from "@/components/ui/VideoBackground";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Mehtab Electronics — Smart Energy & Security Systems",
  description:
    "Mehtab Electronics designs and installs CCTV, smart-home automation, solar power, inverters, UPS, batteries and networking across Pakistan. A futuristic energy & security showroom.",
  keywords: ["CCTV installation Pakistan","solar panel installation","hybrid solar systems","inverters","smart home automation","UPS systems","electric fencing","networking wifi"],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Mehtab Electronics — Smart Energy & Security Systems",
    description: "Futuristic energy & security showroom: solar, CCTV, smart home, inverters and more.",
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
          <VideoBackground />
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
