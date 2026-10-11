"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  ShoppingCart,
  Receipt,
  Camera,
  Layers,
  Wallet,
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
import type { ProductLine } from "@/components/admin/ui/ProductLineItems";
import { mergeGroup, useProductGroups } from "@/components/admin/ui/GroupPicker";
import { CameraScanModal } from "@/components/admin/ui/BarcodeScanner";
import { api } from "@/lib/admin/services";
import {
  LineEditorFooter,
  LineEditorFrame,
  LineEditorHeader,
  LineEditorRow,
  LineTotal,
  PriceInput,
  QtyStepper,
} from "@/components/admin/ui/LineItems";
import { pkr } from "@/lib/admin/format";
import { invoiceTotals } from "@/lib/invoice";
import { cn } from "@/lib/utils";

type CartLine = ProductLine;

export default function PosPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [received, setReceived] = useState<string>("");
  // Put cash above the sale total towards the customer's previous balance.
  const [payPrevious, setPayPrevious] = useState(true);

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
  // Fresh record for the selected customer so the previous balance is current.
  const { data: customer, isFetching: customerLoading } = useQuery({
    queryKey: ["pos-customer", customerId],
    queryFn: () => api.getCustomer(customerId),
    enabled: !!customerId,
  });
  const previousBalance = customerId
    ? (customer?.balance ??
      customers?.items.find((c) => c.id === customerId)?.balance ??
      0)
    : 0;
  // Product groups / bundles for one-click add.
  const { groups } = useProductGroups();

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
    const stockById = new Map(group.items.map((i) => [i.productId, i.stock ?? 0]));
    const res = mergeGroup(
      cart,
      group,
      (it) => ({
        productId: it.productId,
        description: it.name || "",
        unitPrice: it.sellingPrice ?? 0,
        qty: it.qty,
      }),
      { cap: (id) => stockById.get(id) ?? 0 },
    );
    if (res.added) {
      setCart(res.lines);
      toast.success(`Added “${group.name}” to cart`);
    }
    if (res.skipped.length) {
      toast.error(`Out of stock, skipped: ${res.skipped.join(", ")}`);
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

  const setQty = (idx: number, next: number) => {
    const line = cart[idx];
    if (!line) return;
    let qty = Math.max(1, Math.floor(next) || 1);
    if (line.productId) {
      const max = stockOf(line.productId) - cartQtyOf(line.productId, idx);
      if (qty > max) {
        toast.error(`Only ${Math.max(0, max)} in stock`);
        qty = Math.max(1, max);
      }
    }
    setCart((c) => c.map((l, i) => (i === idx ? { ...l, qty } : l)));
  };

  const setPrice = (idx: number, unitPrice: number) =>
    setCart((c) =>
      c.map((l, i) => (i === idx ? { ...l, unitPrice: Math.max(0, unitPrice) } : l)),
    );

  const removeLine = (idx: number) =>
    setCart((c) => c.filter((_, i) => i !== idx));

  const totals = invoiceTotals({ items: cart, discount });
  const isWalkIn = !customerId;
  const paidNow =
    received === "" ? totals.total : Math.min(totals.total, Number(received) || 0);
  const extraCash = Math.max(0, (Number(received) || 0) - totals.total);
  const balancePayment =
    !isWalkIn && payPrevious ? Math.min(extraCash, Math.max(0, previousBalance)) : 0;
  const change = extraCash - balancePayment;
  const itemCount = cart.reduce((s, l) => s + l.qty, 0);
  const balanceAfter = previousBalance + totals.total - paidNow - balancePayment;
  const walkInShort = isWalkIn && paidNow < totals.total;

  const checkout = useMutation({
    mutationFn: () =>
      api.createSale({
        customerId: customerId || null,
        items: cart.filter((l) => l.description.trim() && l.qty > 0),
        discount,
        paid: paidNow,
        balancePayment,
      }),
    onSuccess: (inv) => {
      toast.success(
        inv.balancePayment > 0
          ? `Sale complete · ${pkr(inv.balancePayment)} paid against previous balance`
          : "Sale complete",
      );
      qc.invalidateQueries({ queryKey: ["pos-customer"] });
      qc.invalidateQueries({ queryKey: ["pos-customers"] });
      qc.invalidateQueries({ queryKey: ["pos-products"] });
      router.push(`/admin/billing/${inv.id}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSell = cart.some((l) => l.description.trim() && l.qty > 0) && !walkInShort;

  return (
    <div>
      <PageHeader
        title="Point of Sale"
        subtitle="Scan a barcode into search (Enter) or tap products — stock, invoice and ledger update automatically."
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
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
            <button
              type="button"
              title="Scan with camera"
              onClick={() => setCameraOpen(true)}
              className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-cyan"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <CameraScanModal
            open={cameraOpen}
            onClose={() => setCameraOpen(false)}
            onCode={(code) => void applyBarcodeScan(code)}
          />
          <p className="mt-1.5 text-[0.65rem] text-white/35">
            Barcode scanners type into this field and press Enter — or tap the camera to scan with your phone. Matches barcode or SKU exactly.
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

          <div className="mt-4 grid max-h-[62vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
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
        </Card>

        {/* cart */}
        <Card className="flex flex-col p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <ShoppingCart className="h-4 w-4" /> Cart
            </div>
            {cart.length > 0 && (
              <span className="text-xs text-white/40">
                {cart.length} line{cart.length === 1 ? "" : "s"} · {itemCount} item
                {itemCount === 1 ? "" : "s"}
              </span>
            )}
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

          {customerId && (
            <div
              className={cn(
                "mb-3 flex items-center justify-between rounded-xl border px-3 py-2.5",
                previousBalance > 0
                  ? "border-amber-300/30 bg-amber-300/5"
                  : "border-white/10 bg-white/[0.03]",
              )}
            >
              <div className="flex items-center gap-2">
                <Wallet
                  className={cn(
                    "h-4 w-4",
                    previousBalance > 0 ? "text-amber-300" : "text-white/40",
                  )}
                />
                <div>
                  <div className="text-xs font-medium text-white/80">
                    Previous balance
                  </div>
                  <div className="text-[0.65rem] text-white/40">
                    {customer?.phone || customer?.name || ""}
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  "text-base font-semibold",
                  previousBalance > 0
                    ? "text-amber-300"
                    : previousBalance < 0
                      ? "text-emerald-300"
                      : "text-white/60",
                )}
              >
                {customerLoading && !customer ? "…" : pkr(previousBalance)}
              </span>
            </div>
          )}

          <div className="min-h-[200px] flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="rounded-xl border border-white/10 py-12 text-center text-sm text-white/40">
                Scan a barcode or tap products to add them.
              </div>
            ) : (
              <LineEditorFrame>
                <LineEditorHeader />
                {cart.map((l, idx) => {
                  const p = l.productId ? findProduct(l.productId) : undefined;
                  const max = l.productId
                    ? Math.max(1, stockOf(l.productId) - cartQtyOf(l.productId, idx))
                    : null;
                  return (
                    <LineEditorRow
                      key={`${l.productId ?? "x"}-${idx}`}
                      index={idx}
                      onRemove={() => removeLine(idx)}
                      item={
                        <div className="line-pad">
                          <div className="font-medium leading-snug text-white">
                            {l.description}
                          </div>
                          {p && (
                            <div className="mt-0.5 text-[0.65rem] text-white/35">
                              {p.sku ? `${p.sku} · ` : ""}stock {p.stock}
                            </div>
                          )}
                        </div>
                      }
                      qty={
                        <QtyStepper
                          value={l.qty}
                          min={1}
                          max={max}
                          onChange={(n) => setQty(idx, n)}
                        />
                      }
                      price={
                        <PriceInput
                          value={l.unitPrice}
                          onChange={(n) => setPrice(idx, n)}
                        />
                      }
                      total={<LineTotal value={l.qty * l.unitPrice} />}
                    />
                  );
                })}
                <LineEditorFooter lines={cart} />
              </LineEditorFrame>
            )}
          </div>

          <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
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
            <div className="flex justify-between rounded-lg bg-cyan/5 px-3 py-2 text-lg font-semibold text-white">
              <span>Total</span>
              <span className="text-cyan">{pkr(totals.total)}</span>
            </div>
            {customerId && (
              <>
                <div className="flex justify-between text-white/60">
                  <span>Previous balance</span>
                  <span>{pkr(previousBalance)}</span>
                </div>
                <div className="flex justify-between font-medium text-white">
                  <span>Total due (incl. previous)</span>
                  <span>{pkr(previousBalance + totals.total)}</span>
                </div>
              </>
            )}
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
            {!isWalkIn && previousBalance > 0 && extraCash > 0 && (
              <label className="flex items-center justify-between gap-2 text-white/60">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={payPrevious}
                    onChange={(e) => setPayPrevious(e.target.checked)}
                  />
                  Apply extra cash to previous balance
                </span>
                <span className="text-amber-300">{pkr(balancePayment)}</span>
              </label>
            )}
            {received !== "" && paidNow < totals.total && (
              <div
                className={cn(
                  "flex justify-between",
                  walkInShort ? "text-red-300" : "text-amber-300",
                )}
              >
                <span>{walkInShort ? "Short (walk-in must pay in full)" : "Unpaid → added to balance"}</span>
                <span>{pkr(totals.total - paidNow)}</span>
              </div>
            )}
            {received !== "" && (
              <div className="flex justify-between text-emerald-300">
                <span>Change</span>
                <span>{pkr(change)}</span>
              </div>
            )}
            {customerId && (
              <div
                className={cn(
                  "flex justify-between font-medium",
                  balanceAfter > 0 ? "text-amber-300" : "text-white/70",
                )}
              >
                <span>Balance after sale</span>
                <span>{pkr(balanceAfter)}</span>
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
