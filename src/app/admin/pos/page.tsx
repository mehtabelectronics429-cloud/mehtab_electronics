"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Receipt,
  ScanBarcode,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import {
  Button,
  Card,
  Input,
  Label,
} from "@/components/admin/ui/primitives";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import { invoiceTotals } from "@/lib/invoice";
import { cn } from "@/lib/utils";

type CartLine = {
  productId: string | null;
  description: string;
  unitPrice: number;
  qty: number;
};

export default function PosPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [received, setReceived] = useState<string>("");

  const searchTerm = q.trim();
  // Base catalogue (capped at 100 by the API) — used for stock lookups on cart lines.
  const { data: products } = useQuery({
    queryKey: ["pos-products"],
    queryFn: () => api.products({ limit: 100 }),
  });
  // Server-side text search so results match the products page exactly (case-insensitive, whole catalogue).
  const { data: searchResults } = useQuery({
    queryKey: ["pos-products-search", searchTerm],
    queryFn: () => api.products({ limit: 100, q: searchTerm }),
    enabled: searchTerm.length > 0,
  });
  const { data: customers } = useQuery({
    queryKey: ["pos-customers"],
    queryFn: () => api.customers({ limit: 200 }),
  });
  // Product groups / bundles for one-click add.
  const { data: groupsData } = useQuery({
    queryKey: ["pos-product-groups"],
    queryFn: () => api.productGroups({ limit: 100 }),
  });
  const groups = useMemo(
    () => (groupsData?.items ?? []).filter((g) => g.active && g.items.length),
    [groupsData],
  );

  const filtered = useMemo(() => {
    const items = (searchTerm ? searchResults?.items : products?.items) ?? [];
    return items.slice(0, 24);
  }, [products, searchResults, searchTerm]);

  // Look up a product across both the base list and current search results (either may hold it).
  const findProduct = (productId: string) =>
    (searchResults?.items ?? []).find((x) => x.id === productId) ??
    (products?.items ?? []).find((x) => x.id === productId);

  const stockOf = (productId: string | null) => {
    if (!productId) return Infinity;
    return findProduct(productId)?.stock ?? 0;
  };

  const cartQtyOf = (productId: string, exceptIdx?: number) =>
    cart.reduce(
      (s, l, i) =>
        l.productId === productId && i !== exceptIdx ? s + l.qty : s,
      0,
    );

  const addProduct = (id: string) => {
    const p = findProduct(id);
    if (!p) return;
    if (p.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    setCart((c) => {
      const idx = c.findIndex((l) => l.productId === id);
      if (idx >= 0) {
        const current = c[idx].qty;
        if (current >= p.stock) {
          toast.error(`Only ${p.stock} in stock`);
          return c;
        }
        return c.map((l, i) => (i === idx ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...c,
        {
          productId: id,
          description: `${p.brand} ${p.model}`.trim(),
          unitPrice: p.sellingPrice,
          qty: 1,
        },
      ];
    });
  };

  /** One-click add every product in a group to the cart at its default qty. */
  const addGroup = (group: (typeof groups)[number]) => {
    const next = [...cart];
    const skipped: string[] = [];
    let added = 0;
    for (const it of group.items) {
      if (!it.productId) continue;
      const stock = it.stock ?? 0;
      if (stock <= 0) {
        skipped.push(it.name || "item");
        continue;
      }
      const idx = next.findIndex((l) => l.productId === it.productId);
      if (idx >= 0) {
        next[idx] = {
          ...next[idx],
          qty: Math.min(next[idx].qty + it.qty, stock),
        };
      } else {
        next.push({
          productId: it.productId,
          description: it.name || "",
          unitPrice: it.sellingPrice ?? 0,
          qty: Math.min(it.qty, stock),
        });
      }
      added += 1;
    }
    if (added) {
      setCart(next);
      toast.success(`Added “${group.name}” to cart`);
    }
    if (skipped.length) {
      toast.error(`Out of stock, skipped: ${skipped.join(", ")}`);
    }
  };

  /** Exact barcode / SKU match from a hardware scanner (Enter after scan). */
  const applyBarcodeScan = async (raw: string) => {
    const code = raw.trim();
    if (!code) return false;
    const lower = code.toLowerCase();
    const exact = (p: { barcode?: string; sku: string }) => {
      const barcode = (p.barcode || "").trim().toLowerCase();
      const sku = (p.sku || "").trim().toLowerCase();
      return (barcode && barcode === lower) || sku === lower;
    };
    const items = [...(products?.items ?? []), ...(searchResults?.items ?? [])];
    let match = items.find(exact);
    if (!match) {
      // Fall back to a direct server search in case the code isn't in the loaded lists yet.
      try {
        const res = await api.products({ q: code, limit: 10 });
        match = res.items.find(exact);
      } catch {
        // ignore, handled by the not-found toast below
      }
    }
    if (!match) {
      toast.error(`No product for barcode/SKU: ${code}`);
      return false;
    }
    addProduct(match.id);
    setQ("");
    toast.success(`Added ${match.brand} ${match.model}`.trim());
    requestAnimationFrame(() => searchRef.current?.focus());
    return true;
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    applyBarcodeScan(q);
  };

  const addCustom = () =>
    setCart((c) => [
      ...c,
      { productId: null, description: "", unitPrice: 0, qty: 1 },
    ]);
  const setLine = (idx: number, patch: Partial<CartLine>) => {
    setCart((c) => {
      const line = c[idx];
      if (!line) return c;
      if (patch.qty !== undefined && line.productId) {
        const max = stockOf(line.productId);
        if (patch.qty > max) {
          toast.error(`Only ${max} in stock`);
          patch = { ...patch, qty: max };
        }
      }
      return c.map((l, i) => (i === idx ? { ...l, ...patch } : l));
    });
  };
  const removeLine = (idx: number) =>
    setCart((c) => c.filter((_, i) => i !== idx));

  const bumpQty = (idx: number, delta: number) => {
    const line = cart[idx];
    if (!line) return;
    const next = Math.max(0, line.qty + delta);
    if (line.productId && delta > 0) {
      const max = stockOf(line.productId);
      if (line.qty >= max) {
        toast.error(`Only ${max} in stock`);
        return;
      }
      setLine(idx, { qty: Math.min(next, max) });
      return;
    }
    setLine(idx, { qty: next });
  };

  const totals = invoiceTotals({ items: cart, discount });
  const change = Math.max(0, (Number(received) || 0) - totals.total);

  const checkout = useMutation({
    mutationFn: () =>
      api.createSale({
        customerId: customerId || null,
        items: cart.filter((l) => l.description.trim() && l.qty > 0),
        discount,
        paid:
          received === ""
            ? totals.total
            : Math.min(totals.total, Number(received) || 0),
      }),
    onSuccess: (inv) => {
      toast.success("Sale complete");
      router.push(`/admin/billing/${inv.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSell = cart.some((l) => l.description.trim() && l.qty > 0);

  return (
    <div>
      <PageHeader
        title="Point of Sale"
        subtitle="Scan a barcode into search (Enter) or tap products — stock, invoice and ledger update automatically."
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* product picker */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Scan barcode / SKU + Enter, or search name…"
              className="pl-9 pr-10"
              autoFocus
            />
            <ScanBarcode className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          </div>
          <p className="mt-1.5 text-[0.65rem] text-white/35">
            Barcode scanners type into this field and press Enter — matches barcode or SKU exactly.
          </p>

          {groups.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-white/40">
                <Layers className="h-3.5 w-3.5" /> Bundles · one-click add
              </div>
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => {
                  const total = g.items.reduce(
                    (s, i) => s + (i.sellingPrice ?? 0) * i.qty,
                    0,
                  );
                  return (
                    <button
                      key={g.id}
                      onClick={() => addGroup(g)}
                      title={g.items
                        .map((i) => `${i.name} ×${i.qty}`)
                        .join(", ")}
                      className="group rounded-xl border border-cyan/25 bg-cyan/5 px-3 py-2 text-left transition-colors hover:border-cyan/50 hover:bg-cyan/10"
                    >
                      <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                        <Plus className="h-3.5 w-3.5 text-cyan" />
                        {g.name}
                      </div>
                      <div className="mt-0.5 text-[0.65rem] text-white/40">
                        {g.items.length} item{g.items.length === 1 ? "" : "s"} ·{" "}
                        {pkr(total)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 grid max-h-[62vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {filtered.map((p) => {
              const inCart = cartQtyOf(p.id);
              const out = p.stock <= 0;
              const atLimit = !out && inCart >= p.stock;
              return (
                <button
                  key={p.id}
                  onClick={() => addProduct(p.id)}
                  disabled={out || atLimit}
                  className={cn(
                    "rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors",
                    out || atLimit
                      ? "cursor-not-allowed opacity-50"
                      : "hover:border-cyan/40 hover:bg-cyan/5",
                  )}
                >
                  <div className="line-clamp-2 text-sm font-medium text-white">
                    {p.brand} {p.model}
                  </div>
                  <div className="mt-1 text-xs text-white/40">
                    {p.category}
                    {p.sku ? ` · ${p.sku}` : ""}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-cyan">
                      {pkr(p.sellingPrice)}
                    </span>
                    <span
                      className={cn(
                        "text-[0.65rem]",
                        out || p.stock <= 5 ? "text-red-300" : "text-white/40",
                      )}
                    >
                      {out ? "Out of stock" : `stock ${p.stock}`}
                    </span>
                  </div>
                </button>
              );
            })}
            {!filtered.length && (
              <div className="col-span-full py-10 text-center text-sm text-white/40">
                No products found.
              </div>
            )}
          </div>
          <button
            onClick={addCustom}
            className="mt-3 inline-flex items-center gap-1 text-xs text-cyan hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add custom line
          </button>
        </Card>

        {/* cart */}
        <Card className="flex flex-col p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80">
            <ShoppingCart className="h-4 w-4" /> Cart
          </div>

          <div className="mb-3">
            <Label>Customer</Label>
            <SearchableSelect
              value={customerId}
              onChange={setCustomerId}
              placeholder="Walk-in customer"
              options={[
                { value: "", label: "Walk-in customer" },
                ...(customers?.items ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                  searchText: `${c.name} ${c.phone || ""}`,
                })),
              ]}
              allowClear={false}
            />
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {cart.length === 0 && (
              <div className="py-8 text-center text-sm text-white/40">
                Tap products to add them.
              </div>
            )}
            {cart.map((l, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={l.description}
                    onChange={(e) =>
                      setLine(idx, { description: e.target.value })
                    }
                    placeholder="Item"
                    className="h-8 flex-1 text-sm"
                  />
                  <button
                    onClick={() => removeLine(idx)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => bumpQty(idx, -1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-white/70"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      value={l.qty}
                      onChange={(e) =>
                        setLine(idx, { qty: Number(e.target.value) || 0 })
                      }
                      className="h-7 w-12 rounded-lg border border-white/10 bg-transparent text-center text-sm text-white"
                    />
                    <button
                      onClick={() => bumpQty(idx, 1)}
                      disabled={
                        !!l.productId && l.qty >= stockOf(l.productId)
                      }
                      className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-white/70 disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <input
                    type="number"
                    value={l.unitPrice}
                    onChange={(e) =>
                      setLine(idx, { unitPrice: Number(e.target.value) || 0 })
                    }
                    className="h-7 w-24 rounded-lg border border-white/10 bg-transparent px-2 text-right text-sm text-white"
                  />
                  <span className="w-24 text-right text-sm font-medium text-white">
                    {pkr(l.qty * l.unitPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>{pkr(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Discount</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="h-8 w-28 rounded-lg border border-white/10 bg-transparent px-2 text-right text-white"
              />
            </div>
            <div className="flex justify-between text-base font-semibold text-white">
              <span>Total</span>
              <span>{pkr(totals.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Cash received</span>
              <input
                type="number"
                value={received}
                onChange={(e) => setReceived(e.target.value)}
                placeholder={String(totals.total)}
                className="h-8 w-28 rounded-lg border border-white/10 bg-transparent px-2 text-right text-white"
              />
            </div>
            {received !== "" && (
              <div className="flex justify-between text-emerald-300">
                <span>Change</span>
                <span>{pkr(change)}</span>
              </div>
            )}
          </div>

          <Button
            onClick={() => checkout.mutate()}
            disabled={!canSell || checkout.isPending}
            className="mt-4 w-full justify-center"
          >
            <Receipt className="h-4 w-4" />{" "}
            {checkout.isPending ? "Processing…" : `Charge ${pkr(totals.total)}`}
          </Button>
        </Card>
      </div>
    </div>
  );
}
