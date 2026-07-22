"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TiltCard from "./TiltCard";
import SmartImage from "./SmartImage";
import type { Product } from "@/lib/data";

function productHref(product: Product) {
  return `/products/${product.category.toLowerCase().replace(/\s+/g, "-")}/${product.id}`;
}

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const details =
    (product.features && product.features.length > 0
      ? product.features
      : product.specs) ?? [];
  const shown = details.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: (index % 4) * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="h-full"
    >
      <TiltCard intensity={5} className="group relative h-full">
        <Link
          href={productHref(product)}
          className="animated-border flex h-full flex-col overflow-hidden rounded-[1.4rem] glass transition-shadow duration-500 hover:shadow-glow"
        >
          <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-steel to-obsidian">
            <SmartImage
              src={product.image}
              alt={product.name}
              className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04060B]/70 via-transparent to-transparent" />
            <span className="absolute left-3 top-3 rounded-full glass hairline px-2.5 py-1 text-[0.58rem] uppercase tracking-widest text-black">
              {product.category}
            </span>
            {product.badge && (
              <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-electric to-cyan px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-widest text-white">
                {product.badge}
              </span>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
            <h3 className="line-clamp-2 min-h-[2.5rem] font-display text-sm leading-snug text-fg sm:text-base">
              {product.name}
            </h3>
            <p className="mt-1 truncate font-mono text-[0.65rem] uppercase tracking-widest text-fg/40">
              {product.model}
            </p>

            <ul className="mt-3 flex flex-1 flex-col gap-1.5">
              {shown.map((item) => (
                <li
                  key={item}
                  className="truncate text-[0.72rem] leading-snug text-fg/65"
                >
                  <span className="mr-1.5 text-brand">·</span>
                  {item}
                </li>
              ))}
              {/* Keep height stable when a product has fewer features */}
              {Array.from({ length: Math.max(0, 4 - shown.length) }).map(
                (_, i) => (
                  <li key={`pad-${i}`} className="h-[1.05rem]" aria-hidden />
                ),
              )}
            </ul>
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  );
}
