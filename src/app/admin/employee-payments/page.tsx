"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Archive, Search, HandCoins } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Badge, Input, Label } from "@/components/admin/ui/primitives";
import { SearchableSelect } from "@/components/admin/ui/SearchableSelect";
import DataTable from "@/components/admin/ui/DataTable";
import Modal from "@/components/admin/ui/Modal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import type { EmployeePayment } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  amount: z.coerce.number().min(0),
  type: z.enum([
    "daily",
    "weekly",
    "monthly",
    "frequent",
    "random",
    "bonus",
    "advance",
  ]),
  method: z.enum(["cash", "bank", "card", "other"]).optional(),
  date: z.string().min(1),
  note: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly (salary)" },
  { value: "frequent", label: "Frequent" },
  { value: "random", label: "Random" },
  { value: "bonus", label: "Bonus" },
  { value: "advance", label: "Advance" },
];
const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

export default function EmployeePaymentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeePayment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EmployeePayment | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["employee-payments", page, q, type],
    queryFn: () =>
      api.employeePayments({
        page,
        limit: 20,
        q: q || undefined,
        type: type === "all" ? undefined : type,
      }),
  });

  const { data: employees } = useQuery({
    queryKey: ["employees-opts-pay"],
    queryFn: () => api.employees({ limit: 300 }),
    enabled: open,
  });

  const pageTotal = useMemo(
    () => (data?.items ?? []).reduce((s, p) => s + (p.amount || 0), 0),
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
  const employeeId = watch("employeeId") || "";
  const typeVal = watch("type") || "monthly";
  const method = watch("method") || "cash";

  const openCreate = () => {
    setEditing(null);
    reset({
      employeeId: "",
      amount: 0,
      type: "monthly",
      method: "cash",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
    setOpen(true);
  };
  const openEdit = (p: EmployeePayment) => {
    setEditing(p);
    reset({
      employeeId: p.employeeId,
      amount: p.amount,
      type: p.type,
      method: p.method || "cash",
      date: p.date,
      note: p.note || "",
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: (form: Form) =>
      editing
        ? api.updateEmployeePayment(editing.id, form)
        : api.createEmployeePayment(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employee-payments"] });
      setOpen(false);
      toast.success(editing ? "Payment updated" : "Payment recorded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: (id: string) => api.archiveEmployeePayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employee-payments"] });
      toast.success("Payment removed");
    },
  });

  const columns: ColumnDef<EmployeePayment>[] = [
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: (i) => (
        <span className="font-medium text-white">
          {i.getValue<string>() || "—"}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: (i) => <Badge>{i.getValue<string>()}</Badge>,
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: (i) => (
        <span className="text-white/60">{i.getValue<string>() || "cash"}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (i) => (
        <span className="text-emerald-300">{pkr(i.getValue<number>())}</span>
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
        title="Employee Payments"
        subtitle="Salaries, bonuses, advances and ad-hoc payments to your team."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Payment
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative mr-2 min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Search employee or note…"
            className="pl-9"
          />
        </div>
        {["all", ...TYPES.map((t) => t.value)].map((f) => (
          <button
            key={f}
            onClick={() => {
              setType(f);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs capitalize transition-colors",
              type === f
                ? "border-cyan/40 bg-cyan/10 text-cyan"
                : "border-white/10 bg-white/5 text-white/50 hover:text-white",
            )}
          >
            {f}
          </button>
        ))}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-2">
          <HandCoins className="h-4 w-4 text-emerald-300" />
          <div>
            <div className="text-[0.62rem] uppercase tracking-wider text-white/40">
              This page
            </div>
            <div className="text-sm font-semibold text-emerald-300">
              {pkr(pageTotal)}
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
          title: "No payments",
          body: "Record your first employee payment.",
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove payment"
        message={`Remove the ${pendingDelete ? pkr(pendingDelete.amount) : ""} payment to ${pendingDelete?.employeeName || "employee"}?`}
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
        title={editing ? "Edit payment" : "New payment"}
        wide
      >
        <form
          onSubmit={handleSubmit((d) => save.mutate(d))}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <Label>Employee</Label>
            <SearchableSelect
              value={employeeId}
              onChange={(v) =>
                setValue("employeeId", v, { shouldValidate: true })
              }
              placeholder="Select employee…"
              options={(employees?.items ?? []).map((e) => ({
                value: e.id,
                label: e.name,
                searchText: `${e.name} ${e.title || ""}`,
              }))}
            />
            {errors.employeeId && (
              <p className="mt-1 text-xs text-red-400">
                {errors.employeeId.message}
              </p>
            )}
          </div>
          <div>
            <Label>Amount</Label>
            <Input type="number" {...register("amount")} />
          </div>
          <div>
            <Label>Type</Label>
            <SearchableSelect
              value={typeVal}
              onChange={(v) =>
                setValue("type", (v as Form["type"]) || "monthly")
              }
              options={TYPES}
              allowClear={false}
            />
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
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
          </div>
          <div>
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
