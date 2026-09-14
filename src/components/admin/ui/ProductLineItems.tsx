"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  searchProductOptions,
  productFromOption,
} from "@/lib/admin/product-search";
import type { SearchableOption } from "@/components/admin/ui/SearchableSelect";
import { pkr } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

export type LineKind = "product" | "labour" | "material" | "other";

export type ProductLine = {
  productId: string | null;
  description: string;
  qty: number;
  unitPrice: number;
  kind?: LineKind;
};

export const emptyLine = (kind: LineKind = "product"): ProductLine => ({
  productId: null,
  description: "",
  qty: 1,
  unitPrice: 0,
  kind,
});

const KIND_OPTIONS: { value: LineKind; label: string }[] = [
  { value: "product", label: "Product" },
  { value: "labour", label: "Labour" },
  { value: "material", label: "Material" },
  { value: "other", label: "Other" },
];

type Props = {
  value: ProductLine[];
  onChange: (lines: ProductLine[]) => void;
  /** Show a per-line kind selector (Quotations). */
  showKind?: boolean;
  /** Available stock for a linked product — enables max-qty enforcement + hint. */
  stockLookup?: (productId: string) => number;
  /** Options for the initial (empty-query) product dropdown. */
  productOptions?: SearchableOption[];
  /** Auto-append a fresh empty row once the last row is filled. Default true. */
  autoRow?: boolean;
  currency?: (n: number) => string;
  className?: string;
};

const lineIsEmpty = (l: ProductLine) =>
  !l.productId && !l.description.trim() && !l.unitPrice;

/**
 * Reusable line-items editor shared by POS, Quotations and Invoices.
 * Each row has ONE combined search-and-view product field, then qty, unit
 * price, a live row total, and a remove control. Completing a field advances
 * focus to the next (product → qty → price → next row), and filling the last
 * row auto-appends a fresh one.
 */
export default function ProductLineItems({
  value,
  onChange,
  showKind = false,
  stockLookup,
  productOptions = [],
  autoRow = true,
  currency = pkr,
  className,
}: Props) {
  const rows = value;
  // Focus registry keyed by `${rowIndex}:${field}`.
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const register = useCallback(
    (key: string) => (el: HTMLInputElement | null) => {
      inputs.current[key] = el;
    },
    [],
  );
  const focusKey = useCallback((key: string) => {
    requestAnimationFrame(() => inputs.current[key]?.focus());
  }, []);

  const setLine = (idx: number, patch: Partial<ProductLine>) =>
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const removeLine = (idx: number) => {
    const next = rows.filter((_, i) => i !== idx);
    onChange(next.length ? next : [emptyLine(showKind ? "product" : "product")]);
  };

  const addRow = () => onChange([...rows, emptyLine()]);

  // Auto-append a trailing empty row once the last row has content.
  useEffect(() => {
    if (!autoRow) return;
    if (rows.length === 0) {
      onChange([emptyLine()]);
      return;
    }
    if (!lineIsEmpty(rows[rows.length - 1])) {
      onChange([...rows, emptyLine()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, autoRow]);

  const advanceAfterPrice = (idx: number) => {
    // Move to the next row's product field (auto-append handles creating it).
    const nextIdx = idx + 1;
    if (nextIdx >= rows.length && autoRow) {
      onChange([...rows, emptyLine()]);
    }
    focusKey(`${nextIdx}:product`);
  };

  const gridCols = showKind
    ? "sm:grid-cols-[minmax(0,1.6fr)_7rem_5.5rem_7rem_6.5rem_2.5rem]"
    : "sm:grid-cols-[minmax(0,1.8fr)_7rem_7rem_6.5rem_2.5rem]";

  return (
    <div className={cn("space-y-2", className)}>
      {/* header (desktop only) */}
      <div
        className={cn(
          "hidden gap-2 px-1 text-[0.62rem] font-semibold uppercase tracking-wider text-white/35 sm:grid",
          gridCols,
        )}
      >
        <span>Item</span>
        {showKind && <span>Type</span>}
        <span className="text-center">Qty</span>
        <span className="text-right">Unit price</span>
        <span className="text-right">Total</span>
        <span />
      </div>

      {rows.map((line, idx) => {
        const stock =
          line.productId && stockLookup ? stockLookup(line.productId) : null;
        const atLimit = stock != null && line.qty >= stock;
        const rowTotal = (line.qty || 0) * (line.unitPrice || 0);
        return (
          <div
            key={idx}
            className={cn(
              "grid grid-cols-2 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2",
              gridCols,
            )}
          >
            {/* combined product search + view */}
            <div className="col-span-2 sm:col-span-1">
              <ProductLineField
                line={line}
                productOptions={productOptions}
                inputRef={register(`${idx}:product`)}
                onPick={(p) => {
                  setLine(idx, {
                    productId: p ? p.id : null,
                    description: p
                      ? `${p.brand} ${p.model}`.trim()
                      : line.description,
                    unitPrice: p ? p.sellingPrice : line.unitPrice,
                    kind: p ? "product" : line.kind,
                  });
                  focusKey(`${idx}:qty`);
                }}
                onText={(text) =>
                  setLine(idx, {
                    description: text,
                    // typing a fresh description unlinks the product
                    productId: text.trim() ? line.productId : null,
                  })
                }
                onUnlink={() => setLine(idx, { productId: null })}
                onCommit={() => focusKey(`${idx}:qty`)}
              />
            </div>

            {showKind && (
              <select
                value={line.kind || "product"}
                onChange={(e) =>
                  setLine(idx, { kind: e.target.value as LineKind })
                }
                className="h-9 rounded-lg border border-white/10 bg-transparent px-2 text-sm text-white outline-none focus:border-cyan/50"
              >
                {KIND_OPTIONS.map((k) => (
                  <option
                    key={k.value}
                    value={k.value}
                    className="bg-[#12151f]"
                  >
                    {k.label}
                  </option>
                ))}
              </select>
            )}

            {/* qty with steppers */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                tabIndex={-1}
                onClick={() =>
                  setLine(idx, { qty: Math.max(0, (line.qty || 0) - 1) })
                }
                className="grid h-8 w-7 shrink-0 place-items-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                ref={register(`${idx}:qty`)}
                type="number"
                inputMode="decimal"
                value={line.qty}
                min={0}
                onChange={(e) => {
                  let q = Number(e.target.value) || 0;
                  if (stock != null && q > stock) q = stock;
                  setLine(idx, { qty: q });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    focusKey(`${idx}:price`);
                  }
                }}
                className="h-8 w-full min-w-0 rounded-lg border border-white/10 bg-transparent text-center text-sm text-white outline-none focus:border-cyan/50"
              />
              <button
                type="button"
                tabIndex={-1}
                disabled={atLimit}
                onClick={() => setLine(idx, { qty: (line.qty || 0) + 1 })}
                className="grid h-8 w-7 shrink-0 place-items-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-30"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* unit price */}
            <input
              ref={register(`${idx}:price`)}
              type="number"
              inputMode="decimal"
              value={line.unitPrice}
              min={0}
              onChange={(e) =>
                setLine(idx, { unitPrice: Number(e.target.value) || 0 })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  advanceAfterPrice(idx);
                }
              }}
              className="h-8 w-full min-w-0 rounded-lg border border-white/10 bg-transparent px-2 text-right text-sm text-white outline-none focus:border-cyan/50"
            />

            {/* row total */}
            <div className="text-right text-sm font-medium text-white">
              {currency(rowTotal)}
              {stock != null && (
                <div
                  className={cn(
                    "text-[0.6rem] font-normal",
                    stock <= 5 ? "text-red-300" : "text-white/35",
                  )}
                >
                  stock {stock}
                </div>
              )}
            </div>

            {/* remove */}
            <button
              type="button"
              onClick={() => removeLine(idx)}
              tabIndex={-1}
              className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
      >
        <Plus className="h-3.5 w-3.5" /> Add line
      </button>
    </div>
  );
}

/* ── combined search-and-view product field ───────────────────────────── */

function ProductLineField({
  line,
  productOptions,
  inputRef,
  onPick,
  onText,
  onUnlink,
  onCommit,
}: {
  line: ProductLine;
  productOptions: SearchableOption[];
  inputRef: (el: HTMLInputElement | null) => void;
  onPick: (product: ProductPick | null) => void;
  onText: (text: string) => void;
  onUnlink: () => void;
  onCommit: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<SearchableOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const trimmed = query.trim();

  // Debounced whole-catalogue search once the user types.
  useEffect(() => {
    if (!open) return;
    if (!trimmed) {
      setRemote([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await searchProductOptions(trimmed);
        if (alive) setRemote(res);
      } catch {
        if (alive) setRemote([]);
      } finally {
        if (alive) setLoading(false);
      }
    }, 200);
    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [open, trimmed]);

  useEffect(() => {
    if (!open) return;
    setHighlight(0);
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const options = useMemo(() => {
    if (trimmed) return remote;
    return productOptions.slice(0, 30);
  }, [trimmed, remote, productOptions]);

  const toPick = (opt: SearchableOption): ProductPick | null => {
    const p = productFromOption(opt);
    if (!p) return null;
    return {
      id: p.id,
      brand: p.brand,
      model: p.model,
      sellingPrice: p.sellingPrice,
    };
  };

  const choose = (opt: SearchableOption) => {
    const pick = toPick(opt);
    onPick(pick);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(options.length - 1, h + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Enter") {
      const opt = open ? options[highlight] : undefined;
      e.preventDefault();
      if (opt) {
        choose(opt);
      }
      // Either way, commit the row and advance to qty.
      setOpen(false);
      onCommit();
      return;
    }
    if (e.key === "Tab") {
      // Let focus move naturally; keep any typed text as a custom line.
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        {line.productId ? (
          <Package className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cyan" />
        ) : (
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
        )}
        <input
          ref={inputRef}
          value={line.description}
          placeholder="Search product or type item…"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onText(e.target.value);
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "h-9 w-full rounded-lg border bg-transparent pl-8 pr-8 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan/50",
            line.productId ? "border-cyan/30" : "border-white/10",
          )}
        />
        {line.description ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              onText("");
              onUnlink();
              setQuery("");
              requestAnimationFrame(() =>
                (rootRef.current?.querySelector("input") as HTMLInputElement)?.focus(),
              );
            }}
            className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded text-white/40 hover:bg-white/10 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        ) : loading ? (
          <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-white/30" />
        ) : null}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#12151f] py-1 shadow-xl shadow-black/40">
          {options.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-white/40">
              {loading
                ? "Searching…"
                : trimmed
                  ? "No products — press Enter to keep as custom line"
                  : "Type to search the catalogue…"}
            </div>
          ) : (
            options.map((o, i) => (
              <button
                key={o.value}
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => {
                  choose(o);
                  onCommit();
                }}
                className={cn(
                  "flex w-full px-3 py-2 text-left text-sm transition",
                  i === highlight
                    ? "bg-cyan/15 text-white"
                    : "text-white/80 hover:bg-white/5",
                )}
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

type ProductPick = {
  id: string;
  brand: string;
  model: string;
  sellingPrice: number;
};
