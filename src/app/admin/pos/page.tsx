"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Card, Input, Label, Select } from "@/components/admin/ui/primitives";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import { invoiceTotals } from "@/lib/invoice";
import { cn } from "@/lib/utils";

type CartLine = { productId: string | null; description: string; unitPrice: number; qty: number };

export default function PosPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [received, setReceived] = useState<string>("");

  const { data: products } = useQuery({ queryKey: ["pos-products"], queryFn: () => api.products({ limit: 300 }) });
  const { data: customers } = useQuery({ queryKey: ["pos-customers"], queryFn: () => api.customers({ limit: 200 }) });

  const filtered = useMemo(() => {
    const items = products?.items ?? [];
    if (!q.trim()) return items.slice(0, 24);
    const s = q.toLowerCase();
    return items.filter((p) => `${p.brand} ${p.model} ${p.sku} ${p.category}`.toLowerCase().includes(s)).slice(0, 24);
  }, [products, q]);

  const addProduct = (id: string) => {
    const p = (products?.items ?? []).find((x) => x.id === id);
    if (!p) return;
    setCart((c) => {
      const idx = c.findIndex((l) => l.productId === id);
      if (idx >= 0) return c.map((l, i) => (i === idx ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { productId: id, description: `${p.brand} ${p.model}`.trim(), unitPrice: p.sellingPrice, qty: 1 }];
    });
  };
  const addCustom = () => setCart((c) => [...c, { productId: null, description: "", unitPrice: 0, qty: 1 }]);
  const setLine = (idx: number, patch: Partial<CartLine>) => setCart((c) => c.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeLine = (idx: number) => setCart((c) => c.filter((_, i) => i !== idx));

  const totals = invoiceTotals({ items: cart, discount });
  const change = Math.max(0, (Number(received) || 0) - totals.total);

  const checkout = useMutation({
    mutationFn: () =>
      api.createSale({
        customerId: customerId || null,
        items: cart.filter((l) => l.description.trim() && l.qty > 0),
        discount,
        paid: received === "" ? totals.total : Math.min(totals.total, Number(received) || 0),
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
      <PageHeader title="Point of Sale" subtitle="Ring up a counter sale — stock, invoice and ledger update automatically." />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* product picker */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products by name, SKU, category…" className="pl-9" />
          </div>
          <div className="mt-4 grid max-h-[62vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addProduct(p.id)}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-cyan/40 hover:bg-cyan/5"
              >
                <div className="line-clamp-2 text-sm font-medium text-white">{p.brand} {p.model}</div>
                <div className="mt-1 text-xs text-white/40">{p.category}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-cyan">{pkr(p.sellingPrice)}</span>
                  <span className={cn("text-[0.65rem]", p.stock <= 5 ? "text-red-300" : "text-white/40")}>stock {p.stock}</span>
                </div>
              </button>
            ))}
            {!filtered.length && <div className="col-span-full py-10 text-center text-sm text-white/40">No products found.</div>}
          </div>
          <button onClick={addCustom} className="mt-3 inline-flex items-center gap-1 text-xs text-cyan hover:underline">
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
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Walk-in customer</option>
              {(customers?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {cart.length === 0 && <div className="py-8 text-center text-sm text-white/40">Tap products to add them.</div>}
            {cart.map((l, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                <div className="flex items-center gap-2">
                  <Input value={l.description} onChange={(e) => setLine(idx, { description: e.target.value })} placeholder="Item" className="h-8 flex-1 text-sm" />
                  <button onClick={() => removeLine(idx)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setLine(idx, { qty: Math.max(0, l.qty - 1) })} className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-white/70"><Minus className="h-3 w-3" /></button>
                    <input type="number" value={l.qty} onChange={(e) => setLine(idx, { qty: Number(e.target.value) || 0 })} className="h-7 w-12 rounded-lg border border-white/10 bg-transparent text-center text-sm text-white" />
                    <button onClick={() => setLine(idx, { qty: l.qty + 1 })} className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-white/70"><Plus className="h-3 w-3" /></button>
                  </div>
                  <input type="number" value={l.unitPrice} onChange={(e) => setLine(idx, { unitPrice: Number(e.target.value) || 0 })} className="h-7 w-24 rounded-lg border border-white/10 bg-transparent px-2 text-right text-sm text-white" />
                  <span className="w-24 text-right text-sm font-medium text-white">{pkr(l.qty * l.unitPrice)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-sm">
            <div className="flex justify-between text-white/60"><span>Subtotal</span><span>{pkr(totals.subtotal)}</span></div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Discount</span>
              <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value) || 0)} className="h-8 w-28 rounded-lg border border-white/10 bg-transparent px-2 text-right text-white" />
            </div>
            <div className="flex justify-between text-base font-semibold text-white"><span>Total</span><span>{pkr(totals.total)}</span></div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Cash received</span>
              <input type="number" value={received} onChange={(e) => setReceived(e.target.value)} placeholder={String(totals.total)} className="h-8 w-28 rounded-lg border border-white/10 bg-transparent px-2 text-right text-white" />
            </div>
            {received !== "" && <div className="flex justify-between text-emerald-300"><span>Change</span><span>{pkr(change)}</span></div>}
          </div>

          <Button onClick={() => checkout.mutate()} disabled={!canSell || checkout.isPending} className="mt-4 w-full justify-center">
            <Receipt className="h-4 w-4" /> {checkout.isPending ? "Processing…" : `Charge ${pkr(totals.total)}`}
          </Button>
        </Card>
      </div>
    </div>
  );
}
