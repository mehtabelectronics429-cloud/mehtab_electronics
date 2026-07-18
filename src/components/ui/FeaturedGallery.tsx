"use client";

import { motion } from "framer-motion";
import SmartImage from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

export type GalleryImage = { src: string; caption?: string; sub?: string };

/**
 * Bento-style featured gallery: the first image is large (2×2), the rest fill
 * the surrounding cells. Great for "recent work" showcases. Lightweight — pure
 * CSS grid, no carousel.
 */
export default function FeaturedGallery({
  images,
  className,
}: {
  images: GalleryImage[];
  className?: string;
}) {
  if (!images.length) return null;
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4",
        "[grid-auto-rows:9rem] sm:[grid-auto-rows:10rem] lg:[grid-auto-rows:12rem]",
        className
      )}
    >
      {images.map((im, i) => (
        <motion.div
          key={im.src + i}
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "group relative overflow-hidden rounded-lg border border-line/15 shadow-card",
            i === 0 && "col-span-2 row-span-2"
          )}
        >
          <SmartImage
            src={im.src}
            alt={im.caption ?? ""}
            className="absolute inset-0 h-full w-full"
            imgClassName="transition-transform duration-700 group-hover:scale-105"
            priority={i === 0}
          />
          {(im.caption || im.sub) && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
              <div className={cn("absolute inset-x-0 bottom-0 p-3", i === 0 && "p-5")}>
                {im.sub && <div className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-brand">{im.sub}</div>}
                {im.caption && (
                  <div className={cn("mt-0.5 font-display uppercase tracking-wide text-white", i === 0 ? "text-lg md:text-2xl" : "text-xs md:text-sm")}>
                    {im.caption}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}
