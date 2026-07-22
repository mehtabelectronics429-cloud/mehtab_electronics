"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import TiltCard from "./TiltCard";
import SmartImage from "./SmartImage";
import { productInquiry } from "@/lib/whatsapp";
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
        <div className="animated-border flex h-full flex-col overflow-hidden rounded-[1.4rem] glass transition-shadow duration-500 hover:shadow-glow">
          <Link
            href={productHref(product)}
            className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-steel to-obsidian"
            aria-label={`View ${product.name}`}
          >
            <SmartImage
              src={product.image}
              alt={product.name}
              className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04060B]/70 via-transparent to-transparent" />
          </Link>

          <div className="flex flex-1 flex-col p-4 sm:p-5">
            <h3 className="line-clamp-2 min-h-[2.5rem] font-display text-sm leading-snug text-fg sm:text-base">
              {product.name}
            </h3>

            <a
              href={productInquiry(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-3.5 py-2.5 text-xs font-medium text-[#052e16] shadow-[0_0_40px_-14px_rgba(37,211,102,0.9)] transition-transform duration-300 hover:scale-[1.02]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}
