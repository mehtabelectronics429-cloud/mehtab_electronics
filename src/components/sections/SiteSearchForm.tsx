"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

export default function SiteSearchForm({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 rounded-lg border border-line/15 bg-surface/70 p-2 shadow-card"
    >
      <Search className="ml-2 h-4 w-4 shrink-0 text-fg/40" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, brands, categories…"
        className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-fg outline-none placeholder:text-fg/40"
      />
      <button type="submit" className="btn-brand !py-2.5 text-sm">
        Search
      </button>
    </form>
  );
}
