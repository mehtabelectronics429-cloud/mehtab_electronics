"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Check } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import { Button, Input, Label, Select } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import { api } from "@/lib/admin/services";
import { useAuth } from "@/lib/admin/auth";
import { pkr } from "@/lib/admin/format";
import type { Invoice } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  customerId: z.string().min(1),
  amount: z.coerce.number().min(0),
  cost: z.coerce.number().min(0).optional(),
  paid: z.coerce.number().min(0).optional(),
  date: z.string().min(1),
  status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
});
type Form = z.infer<typeof schema>;

export default function BillingPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const router = useRouter();
  const qc = useQueryClient();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", page, status],
    queryFn: () => api.invoices({ page, limit: 10, status }),
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-opts"],
    queryFn: () => api.customers({ limit: 100 }),
    enabled: open,
  });

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const wAmount = Number(watch("amount") || 0);
  const wCost = Number(watch("cost") || 0);
  const wProfit = wAmount - wCost;
  const wMargin = wAmount > 0 ? (wProfit / wAmount) * 100 : 0;

  const create = useMutation({
    mutationFn: (form: Form) => api.createInvoice({ ...form, status: form.status || "pending" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      setOpen(false);
      toast.success("Invoice created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approve = useMutation({
    mutationFn: (id: string) => api.updateInvoice(id, { status: "approved" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice approved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: "number", header: "Invoice", cell: (i) => <span className="font-medium text-white">{i.getValue<string>()}</span> },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "amount", header: "Amount", cell: (i) => pkr(i.getValue<number>()) },
    {
      id: "profit",
      header: "Profit",
      cell: (i) => {
        const profit = i.row.original.amount - (i.row.original.cost ?? 0);
        return <span className={profit >= 0 ? "text-emerald-300" : "text-red-300"}>{pkr(profit)}</span>;
      },
    },
    {
      accessorKey: "paid",
      header: "Paid",
      cell: (i) => <span className="text-emerald-300">{pkr(i.getValue<number>())}</span>,
    },
    {
      id: "balance",
      header: "Balance",
      cell: (i) => (
        <span className="text-amber-300">{pkr(i.row.original.amount - i.row.original.paid)}</span>
      ),
    },
    { accessorKey: "status", header: "Status", cell: (i) => <StatusBadge status={i.getValue<string>()} /> },
    ...(isAdmin
      ? [
          {
            id: "act",
            header: "",
            cell: (i: { row: { original: Invoice } }) =>
              i.row.original.status === "pending" ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    approve.mutate(i.row.original.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300"
                >
                  <Check className="h-3.5 w-3.5" /> Approve
                </button>
              ) : null,
          } as ColumnDef<Invoice>,
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Billing" : "My Billing"}
        subtitle="Invoices, payments and approvals."
        actions={
          <Button
            onClick={() => {
              reset({
                customerId: "",
                amount: 0,
                cost: 0,
                paid: 0,
                date: new Date().toISOString().slice(0, 10),
                status: "pending",
              });
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "draft", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => {
              setStatus(f);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs capitalize transition-colors",
              status === f ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-white/50 hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        onRowClick={(row) => router.push(`/admin/billing/${row.id}`)}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        empty={{ title: "No invoices" }}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="New invoice" wide>
        <form onSubmit={handleSubmit((d) => create.mutate(d))} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Customer</Label>
            <Select {...register("customerId")}>
              <option value="">Select…</option>
              {(customers?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
          </div>
          <div>
            <Label>Amount (sale)</Label>
            <Input type="number" {...register("amount")} />
          </div>
          <div>
            <Label>Cost (goods + materials)</Label>
            <Input type="number" {...register("cost")} placeholder="0" />
          </div>
          <div>
            <Label>Paid</Label>
            <Input type="number" {...register("paid")} />
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <div className="text-[0.65rem] uppercase tracking-wider text-white/40">Profit / Margin</div>
              <div className="mt-0.5 text-sm font-medium text-emerald-300">
                {pkr(wProfit)} <span className="text-white/40">·</span> {wMargin.toFixed(0)}%
              </div>
            </div>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || create.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
