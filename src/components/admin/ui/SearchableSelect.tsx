"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchableOption = {
  value: string;
  label: string;
  searchText?: string;
  /** Optional payload returned to onChange so pickers can read row data. */
  data?: Record<string, unknown>;
};

type Props = {
  options: SearchableOption[];
  value: string;
  onChange: (value: string, option?: SearchableOption) => void;
  placeholder?: string;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  name?: string;
  /**
   * Optional server-backed search. When provided, typing queries the whole
   * catalogue (like POS) instead of only filtering the `options` already
   * loaded. Return the matching options — carry any row data on `.data`.
   */
  onSearch?: (query: string) => Promise<SearchableOption[]>;
  /** Debounce for onSearch, ms. */
  searchDebounceMs?: number;
};

/** Each whitespace token must appear (AND); tokens are matched anywhere (partial). */
function tokenMatch(haystack: string, tokens: string[]) {
  const h = haystack.toLowerCase();
  return tokens.every((t) => h.includes(t));
}

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
  onSearch,
  searchDebounceMs = 200,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [remote, setRemote] = useState<SearchableOption[]>([]);
  const [loading, setLoading] = useState(false);
  // Remembers the picked option so its label persists even when it isn't in
  // the current (server-filtered) result set.
  const [remembered, setRemembered] = useState<SearchableOption | null>(null);

  const trimmed = query.trim();

  const selected = useMemo(() => {
    return (
      options.find((o) => o.value === value) ??
      remote.find((o) => o.value === value) ??
      (remembered?.value === value ? remembered : undefined)
    );
  }, [options, remote, remembered, value]);

  // Keep the remembered label fresh whenever we can resolve the current value.
  // Guarded so an unchanged match doesn't churn state (options is a fresh array
  // each parent render, which would otherwise loop).
  useEffect(() => {
    if (!value) return;
    const found =
      options.find((o) => o.value === value) ??
      remote.find((o) => o.value === value);
    if (found)
      setRemembered((prev) =>
        prev?.value === found.value && prev?.label === found.label
          ? prev
          : found,
      );
  }, [value, options, remote]);

  const clientFiltered = useMemo(() => {
    if (!trimmed) return options;
    const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    return options.filter((o) => tokenMatch(o.searchText || o.label, tokens));
  }, [options, trimmed]);

  const displayed = onSearch ? (trimmed ? remote : options) : clientFiltered;

  // Debounced server search.
  useEffect(() => {
    if (!onSearch || !open) return;
    if (!trimmed) {
      setRemote([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await onSearch(trimmed);
        if (alive) setRemote(res);
      } catch {
        if (alive) setRemote([]);
      } finally {
        if (alive) setLoading(false);
      }
    }, searchDebounceMs);
    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [onSearch, open, trimmed, searchDebounceMs]);

  useEffect(() => {
    if (!open) return;
    setHighlight(0);
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Reset the active row when the query changes or new server results arrive
  // (not on every render — that would fight arrow-key navigation).
  useEffect(() => {
    setHighlight(0);
  }, [trimmed, remote]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setRemote([]);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const pick = (opt: SearchableOption) => {
    setRemembered(opt);
    onChange(opt.value, opt);
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
      setHighlight((h) => Math.min(displayed.length - 1, h + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = displayed[highlight];
      if (opt) pick(opt);
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
          "admin-select flex h-10 w-full items-center gap-2 rounded-xl border px-3 text-left text-sm outline-none transition focus:border-cyan/50 focus:ring-2 focus:ring-cyan/15 disabled:opacity-50",
          "border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#12151f] dark:text-white",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            !selected && "text-slate-400 dark:text-white/35",
          )}
        >
          {selected?.label || placeholder}
        </span>
        {allowClear && value ? (
          <span
            role="button"
            tabIndex={-1}
            className="grid h-5 w-5 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : null}
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-white/40" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-black/10 dark:border-white/10 dark:bg-[#12151f] dark:shadow-black/40">
          <div className="relative border-b border-slate-200 p-2 dark:border-white/10">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-white/35" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={onSearch ? "Search whole catalogue…" : "Search…"}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-8 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35"
            />
            {loading ? (
              <Loader2 className="absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-slate-400 dark:text-white/35" />
            ) : null}
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-56 overflow-y-auto py-1"
          >
            {displayed.length === 0 ? (
              <li className="px-3 py-6 text-center text-xs text-slate-400 dark:text-white/40">
                {loading ? "Searching…" : trimmed || !onSearch ? emptyLabel : "Type to search…"}
              </li>
            ) : (
              displayed.map((o, i) => (
                <li key={o.value || `__empty_${i}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={o.value === value}
                    className={cn(
                      "flex w-full px-3 py-2 text-left text-sm transition",
                      i === highlight
                        ? "bg-cyan/15 text-slate-900 dark:text-white"
                        : "text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/5",
                      o.value === value && "text-cyan",
                    )}
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => pick(o)}
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
