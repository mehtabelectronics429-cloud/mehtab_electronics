"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchableOption = {
  value: string;
  label: string;
  searchText?: string;
};

type Props = {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  name?: string;
};

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  emptyLabel = "No matches",
  className,
  disabled,
  allowClear = true,
  name,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      (o.searchText || o.label).toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    setHighlight(0);
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(filtered.length - 1, h + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) pick(opt.value);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={cn(
          "admin-select flex h-10 w-full items-center gap-2 rounded-xl border border-white/10 bg-[var(--admin-input)] px-3 text-left text-sm text-[var(--admin-fg)] outline-none transition focus:border-cyan/50 focus:ring-2 focus:ring-cyan/15 disabled:opacity-50",
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-white/35")}>
          {selected?.label || placeholder}
        </span>
        {allowClear && value ? (
          <span
            role="button"
            tabIndex={-1}
            className="grid h-5 w-5 place-items-center rounded text-white/40 hover:bg-white/10 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : null}
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-white/40" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-[var(--admin-input)] shadow-xl shadow-black/20">
          <div className="relative border-b border-white/10 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search…"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-8 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan/40"
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-white/40">
                {emptyLabel}
              </li>
            ) : (
              filtered.map((o, i) => (
                <li key={o.value || `__empty_${i}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={o.value === value}
                    className={cn(
                      "flex w-full px-3 py-2 text-left text-sm transition",
                      i === highlight ? "bg-cyan/15 text-white" : "text-white/80 hover:bg-white/5",
                      o.value === value && "text-cyan",
                    )}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => pick(o.value)}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
