"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import TiltCard from "./TiltCard";
import SmartImage from "./SmartImage";
import { productInquiry } from "@/lib/whatsapp";
import type { Product } from "@/lib/data";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: (index % 3) * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <TiltCard intensity={6} className="group relative h-full">
        <div className="animated-border flex h-full flex-col overflow-hidden rounded-[1.6rem] glass transition-shadow duration-500 hover:shadow-glow">
          {/* floating image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-gradient-to-br from-steel to-obsidian [transform:translateZ(30px)]">
            <SmartImage
              src={product.image}
              alt={product.name}
              className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04060B]/70 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 rounded-full glass hairline px-3 py-1 text-[0.62rem] uppercase tracking-widest text-black">
              {product.category}
            </span>
            {product.badge && (
              <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-electric to-cyan px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-white">
                {product.badge}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-base leading-snug text-fg">
                {product.name}
              </h3>
            </div>
            <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-widest text-fg/40">
              {product.model}
            </p>
            {/* <p className="mt-3 text-sm leading-relaxed text-fg/60">
              {product.description?.slice(0, 100)}...
            </p> */}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.specs.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-fg/5 px-2.5 py-1 text-[0.68rem] text-fg/70 ring-1 ring-line/10"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/products/${product.category.toLowerCase().replace(/\s+/g, "-")}/${product.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-cyan transition-colors hover:text-electric"
              >
                Details <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href={productInquiry(product)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-3.5 py-2 text-xs font-medium text-[#052e16] shadow-[0_0_40px_-14px_rgba(37,211,102,0.9)] transition-transform duration-300 hover:scale-[1.03]"
              >
                <MessageCircle className="h-4 w-4" /> Enquire
              </a>
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}
