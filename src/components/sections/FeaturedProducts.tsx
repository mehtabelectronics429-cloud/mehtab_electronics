"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ProductCard from "@/components/ui/ProductCard";
import { PRODUCTS } from "@/lib/data";

export default function FeaturedProducts() {
  const featured = PRODUCTS.filter((p) => p.badge).slice(0, 6);
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28 md:px-8 md:py-40">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Featured products"
          title={<>Hardware, <span className="text-gradient">hand-picked</span>.</>}
        />
        <Reveal delay={0.1}>
          <Link href="/products" className="group inline-flex items-center gap-2 rounded-full glass hairline px-5 py-3 text-sm text-fg transition-colors hover:border-cyan/40">
            Browse all products
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}
