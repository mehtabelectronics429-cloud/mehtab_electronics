"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export default function ProductsCatalog({ products }: { products: Product[] }) {
  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
    return ["All", ...unique];
  }, [products]);

  const [active, setActive] = useState("All");
  const filtered = useMemo(
    () => (active === "All" ? products : products.filter((p) => p.category === active)),
    [active, products]
  );

  if (products.length === 0) {
    return (
      <section className="relative mx-auto max-w-3xl px-6 py-24 text-center md:px-8">
        <p className="font-display text-2xl text-fg">Catalogue updating</p>
        <p className="mt-3 text-sm leading-relaxed text-fg/60">
          New stock is being published from our warehouse. Reach out on WhatsApp for current
          availability and a quote.
        </p>
        <a
          href={waLink("Hello,\n\nI would like to inquire about available products and pricing.")}
          target="_blank"
          rel="noopener noreferrer"
          className="sheen mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-[#052e16]"
        >
          <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
        </a>
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20 md:px-8">
      <div className="mb-12 flex flex-wrap justify-center gap-2.5">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm transition-colors duration-300",
              c === active ? "text-obsidian" : "text-fg/65 glass hairline hover:text-fg"
            )}
          >
            {c === active && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan to-electric"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{c}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
            >
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-fg/50">No products in this category yet.</p>
      )}
    </section>
  );
}
