"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function ProductsCatalog() {
  const [active, setActive] = useState("All");
  const filtered = useMemo(
    () => (active === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active)),
    [active]
  );

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20 md:px-8">
      {/* category filter */}
      <div className="mb-12 flex flex-wrap justify-center gap-2.5">
        {PRODUCT_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm transition-colors duration-300",
              c === active ? "text-obsidian" : "text-fg/65 glass hairline hover:text-fg"
            )}
          >
            {c === active && (
              <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan to-electric" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span className="relative z-10">{c}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}>
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
