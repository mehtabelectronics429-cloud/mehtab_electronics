"use client";

import { usePathname } from "next/navigation";
import SmoothScroll from "@/components/providers/SmoothScroll";
import CursorGlow from "@/components/ui/CursorGlow";
import ScrollProgress from "@/components/ui/ScrollProgress";
import SiteBackground from "@/components/ui/SiteBackground";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The admin app renders its own chrome — keep the marketing site out of it.
  if (pathname?.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <SiteBackground />
      <ScrollProgress />
      <CursorGlow />
      <SmoothScroll>
        <Navbar />
        {children}
        <Footer />
      </SmoothScroll>
    </>
  );
}
