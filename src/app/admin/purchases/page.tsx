"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import { Button, Input, Label, Select } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import { invoiceTotals } from "@/lib/invoice";
import type { Purchase } from "@/lib/admin/types";

const schema = z.object({
  supplierId: z.string().min(1, "Select a supplier"),
  supplierInvoiceNo: z.string().optional(),
  date: z.string().min(1),
});
type Form = z.infer<typeof schema>;
type ItemRow = {
  productId: string;
  name: string;
  unitCost: number;
  qty: number;
};
const money = (n: number) =>
  n.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function PurchasesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ItemRow[]>([
    { productId: "", name: "", unitCost: 0, qty: 1 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [paid, setPaid] = useState(0);
  const [payFor, setPayFor] = useState<Purchase | null>(null);
  const [payAmt, setPayAmt] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["purchases", page],
    queryFn: () => api.purchases({ page, limit: 10 }),
  });
  const { data: suppliers } = useQuery({
    queryKey: ["suppliers-opts"],
    queryFn: () => api.suppliers({ limit: 200 }),
    enabled: open,
  });
  const { data: products } = useQuery({
    queryKey: ["products-opts"],
    queryFn: () => api.products({ limit: 300 }),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const subtotal = rows.reduce((s, r) => s + (r.qty * r.unitCost || 0), 0);
  const total = useMemo(
    () =>
      invoiceTotals({
        items: rows.map((r) => ({ qty: r.qty, unitPrice: r.unitCost })),
        discount,
        shipping,
      }).total,
    [rows, discount, shipping],
  );

  const setRow = (i: number, patch: Partial<ItemRow>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const pickProduct = (i: number, id: string) => {
    if (!id) return setRow(i, { productId: "", name: "", unitCost: 0 });
    const p = (products?.items ?? []).find((x) => x.id === id);
    setRow(i, {
      productId: id,
      name: p ? `${p.brand} ${p.model}`.trim() : "",
      unitCost: p ? p.purchasePrice : 0,
    });
  };

  const openCreate = () => {
    reset({
      supplierId: "",
      supplierInvoiceNo: "",
      date: new Date().toISOString().slice(0, 10),
    });
    setRows([{ productId: "", name: "", unitCost: 0, qty: 1 }]);
    setDiscount(0);
    setShipping(0);
    setPaid(0);
    setOpen(true);
  };

  const create = useMutation({
    mutationFn: (form: Form) =>
      api.createPurchase({
        ...form,
        items: rows
          .filter((r) => r.name.trim() && r.qty > 0)
          .map((r) => ({
            productId: r.productId || null,
            name: r.name.trim(),
            qty: r.qty,
            unitCost: r.unitCost,
          })),
        discount,
        shipping,
        paid,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setOpen(false);
      toast.success("Purchase recorded  stock updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pay = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      api.payPurchase(id, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      setPayFor(null);
      setPayAmt("");
      toast.success("Payment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns: ColumnDef<Purchase>[] = [
    {
      accessorKey: "ref",
      header: "Ref",
      cell: (i) => (
        <span className="font-medium text-white">{i.getValue<string>()}</span>
      ),
    },
    { accessorKey: "supplier", header: "Supplier" },
    {
      accessorKey: "supplierInvoiceNo",
      header: "Their Inv#",
      cell: (i) => i.getValue<string>() || "",
    },
    { accessorKey: "date", header: "Date" },
    {
      accessorKey: "amount",
      header: "Total",
      cell: (i) => pkr(i.getValue<number>()),
    },
    {
      accessorKey: "paid",
      header: "Paid",
      cell: (i) => (
        <span className="text-emerald-300">{pkr(i.getValue<number>())}</span>
      ),
    },
    {
      id: "bal",
      header: "Balance",
      cell: (i) => (
        <span className="text-amber-300">
          {pkr(i.row.original.amount - i.row.original.paid)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (i) => <StatusBadge status={i.getValue<string>()} />,
    },
    {
      id: "act",
      header: "",
      cell: (i) =>
        i.row.original.amount - i.row.original.paid > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPayFor(i.row.original);
              setPayAmt(String(i.row.original.amount - i.row.original.paid));
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300"
          >
            <Wallet className="h-3.5 w-3.5" /> Pay
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Purchases"
        subtitle="Supplier bills for stock you buy in bulk  receiving updates inventory & payables."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Purchase
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        empty={{ title: "No purchases yet" }}
      />

      {/* create */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New purchase (supplier bill)"
        wide
      >
        <form
          onSubmit={handleSubmit((d) => create.mutate(d))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <Label>Supplier</Label>
            <Select {...register("supplierId")}>
              <option value="">Select…</option>
              {(suppliers?.items ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Supplier invoice #</Label>
            <Input
              {...register("supplierInvoiceNo")}
              placeholder="Their bill number"
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
          </div>

          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <Label className="mb-0">Items received</Label>
              <button
                type="button"
                onClick={() =>
                  setRows((r) => [
                    ...r,
                    { productId: "", name: "", unitCost: 0, qty: 1 },
                  ])
                }
                className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 sm:grid-cols-[1.3fr_1.7fr_0.9fr_0.6fr_auto]"
                >
                  <Select
                    value={row.productId}
                    onChange={(e) => pickProduct(idx, e.target.value)}
                  >
                    <option value="">Custom / not in catalogue…</option>
                    {(products?.items ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand} {p.model}
                      </option>
                    ))}
                  </Select>
                  <Input
                    value={row.name}
                    onChange={(e) => setRow(idx, { name: e.target.value })}
                    placeholder="Item name"
                  />
                  <Input
                    type="number"
                    value={row.unitCost}
                    onChange={(e) =>
                      setRow(idx, { unitCost: Number(e.target.value) || 0 })
                    }
                    placeholder="Unit cost"
                  />
                  <Input
                    type="number"
                    value={row.qty}
                    onChange={(e) =>
                      setRow(idx, { qty: Number(e.target.value) || 0 })
                    }
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    disabled={rows.length <= 1}
                    onClick={() =>
                      setRows((rs) => rs.filter((_, i) => i !== idx))
                    }
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/40">
              Catalogue items increase stock and update their purchase cost.
              Custom items are recorded on the bill only.
            </p>
          </div>

          <div>
            <Label>Discount</Label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Shipping</Label>
            <Input
              type="number"
              value={shipping}
              onChange={(e) => setShipping(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Amount paid now</Label>
            <Input
              type="number"
              value={paid}
              onChange={(e) => setPaid(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-2">
              <div className="text-[0.65rem] uppercase tracking-wider text-white/40">
                Total bill
              </div>
              <div className="text-lg font-semibold text-white">
                Rs {money(total)}
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || create.isPending}>
              Record purchase
            </Button>
          </div>
        </form>
      </Modal>

      {/* pay */}
      <Modal
        open={!!payFor}
        onClose={() => setPayFor(null)}
        title={`Pay supplier · ${payFor?.ref ?? ""}`}
      >
        <div className="space-y-4">
          <div className="text-sm text-white/60">
            Balance owed:{" "}
            <span className="text-amber-300">
              {pkr((payFor?.amount ?? 0) - (payFor?.paid ?? 0))}
            </span>
          </div>
          <div>
            <Label>Payment amount</Label>
            <Input
              type="number"
              value={payAmt}
              onChange={(e) => setPayAmt(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPayFor(null)}>
              Cancel
            </Button>
            <Button
              disabled={pay.isPending}
              onClick={() =>
                payFor &&
                pay.mutate({ id: payFor.id, amount: Number(payAmt) || 0 })
              }
            >
              Record payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
