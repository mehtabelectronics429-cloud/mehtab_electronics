"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Archive, Search, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Badge, Input, Label } from "@/components/admin/ui/primitives";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import type { Expense } from "@/lib/admin/types";

const schema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0),
  date: z.string().min(1),
  paidTo: z.string().optional(),
  method: z.enum(["cash", "bank", "card", "other"]).optional(),
  note: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", page, q],
    queryFn: () => api.expenses({ page, limit: 20, q: q || undefined }),
  });

  const rangeTotal = useMemo(
    () => (data?.items ?? []).reduce((s, e) => s + (e.amount || 0), 0),
    [data],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const method = watch("method") || "cash";

  const openCreate = () => {
    setEditing(null);
    reset({
      category: "",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      paidTo: "",
      method: "cash",
      note: "",
    });
    setOpen(true);
  };
  const openEdit = (e: Expense) => {
    setEditing(e);
    reset({
      category: e.category,
      amount: e.amount,
      date: e.date,
      paidTo: e.paidTo || "",
      method: e.method || "cash",
      note: e.note || "",
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: (form: Form) =>
      editing ? api.updateExpense(editing.id, form) : api.createExpense(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setOpen(false);
      toast.success(editing ? "Expense updated" : "Expense recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense removed");
    },
  });

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "category",
      header: "Category",
      cell: (i) => (
        <span className="font-medium text-white">{i.getValue<string>()}</span>
      ),
    },
    { accessorKey: "paidTo", header: "Paid to" },
    {
      accessorKey: "method",
      header: "Method",
      cell: (i) => <Badge>{i.getValue<string>() || "cash"}</Badge>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (i) => (
        <span className="text-amber-300">{pkr(i.getValue<number>())}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: (i) => i.getValue<string>()?.slice(0, 10),
    },
    {
      id: "actions",
      header: "",
      cell: (i) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(i.row.original);
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete(i.row.original);
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-300"
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Record and track business expenses."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Expense
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search category, payee or note…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-2">
          <Wallet className="h-4 w-4 text-amber-300" />
          <div>
            <div className="text-[0.62rem] uppercase tracking-wider text-white/40">
              This page
            </div>
            <div className="text-sm font-semibold text-amber-300">
              {pkr(rangeTotal)}
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        onRowClick={openEdit}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        empty={{
          title: "No expenses",
          body: "Record your first expense to start tracking.",
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove expense"
        message={`Remove the ${pendingDelete?.category} expense of ${pendingDelete ? pkr(pendingDelete.amount) : ""}?`}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          archive.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          });
        }}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit expense" : "New expense"}
        wide
      >
        <form
          onSubmit={handleSubmit((d) => save.mutate(d))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <Label>Category</Label>
            <Input
              {...register("category")}
              placeholder="Rent, fuel, utilities…"
            />
            {errors.category && (
              <p className="mt-1 text-xs text-red-400">
                {errors.category.message}
              </p>
            )}
          </div>
          <div>
            <Label>Amount</Label>
            <Input type="number" {...register("amount")} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
          </div>
          <div>
            <Label>Method</Label>
            <SearchableSelect
              value={method}
              onChange={(v) =>
                setValue("method", (v as Form["method"]) || "cash")
              }
              options={METHODS}
              allowClear={false}
            />
          </div>
          <div>
            <Label>Paid to</Label>
            <Input {...register("paidTo")} placeholder="Vendor / person" />
          </div>
          <div className="sm:col-span-2">
            <Label>Note</Label>
            <Input {...register("note")} placeholder="Optional details" />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
