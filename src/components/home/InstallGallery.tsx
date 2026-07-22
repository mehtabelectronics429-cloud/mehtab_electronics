import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import FeaturedGallery, {
  type GalleryImage,
} from "@/components/ui/FeaturedGallery";
import { SOLAR_PANELS, INVERTERS, BATTERIES, CAMERA } from "@/lib/assets";

// 1 big + 4 small  a clean featured block of real jobs.
const IMAGES: GalleryImage[] = [
  { src: SOLAR_PANELS[1], sub: "Solar", caption: "Commercial rooftop array" },
  { src: INVERTERS[0], sub: "Inverter", caption: "Hybrid inverter bank" },
  { src: SOLAR_PANELS[3], sub: "Solar", caption: "Residential rooftop" },
  { src: CAMERA, sub: "CCTV", caption: "Camera install" },
  { src: BATTERIES[0], sub: "Battery", caption: "Backup bank" },
];

export default function InstallGallery() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mono-label">Recent work</div>
            <h2 className="mt-4 display-lg text-fg">
              Installed across
              <br />
              <span className="text-accent">Punjab.</span>
            </h2>
          </div>
          <Link
            href="/projects"
            className="hidden shrink-0 items-center gap-1.5 border-b border-brand/60 pb-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-brand transition-colors hover:border-brand sm:inline-flex"
          >
            See all projects <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-12">
          <FeaturedGallery images={IMAGES} />
        </div>
      </div>
    </section>
  );
}
