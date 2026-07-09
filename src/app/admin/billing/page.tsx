"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Check } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import { Button } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import { api } from "@/lib/admin/services";
import { useAuth } from "@/lib/admin/auth";
import { pkr } from "@/lib/admin/format";
import type { Invoice } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data, isLoading } = useQuery({ queryKey: ["invoices"], queryFn: api.invoices });
  const [status, setStatus] = useState("all");
  const rows = useMemo(() => (data ?? []).filter((v) => status === "all" || v.status === status), [data, status]);

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: "number", header: "Invoice", cell: (i) => <span className="font-medium text-white">{i.getValue<string>()}</span> },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "amount", header: "Amount", cell: (i) => pkr(i.getValue<number>()) },
    { accessorKey: "paid", header: "Paid", cell: (i) => <span className="text-emerald-300">{pkr(i.getValue<number>())}</span> },
    { id: "balance", header: "Balance", cell: (i) => <span className="text-amber-300">{pkr(i.row.original.amount - i.row.original.paid)}</span> },
    { accessorKey: "status", header: "Status", cell: (i) => <StatusBadge status={i.getValue<string>()} /> },
    ...(isAdmin ? [{ id: "act", header: "", cell: (i: any) => i.row.original.status === "pending" ? <button onClick={(e) => { e.stopPropagation(); toast.success(`${i.row.original.number} approved`); }} className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300"><Check className="h-3.5 w-3.5" /> Approve</button> : null } as ColumnDef<Invoice>] : []),
  ];

  return (
    <div>
      <PageHeader title={isAdmin ? "Billing" : "My Billing"} subtitle="Invoices, payments and approvals."
        actions={<Button onClick={() => toast.success("New invoice — products, labour, tax, advance")}><Plus className="h-4 w-4" /> New Invoice</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "draft", "pending", "approved", "rejected"].map((f) => (
          <button key={f} onClick={() => setStatus(f)} className={cn("rounded-full border px-3 py-1.5 text-xs capitalize transition-colors", status === f ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-white/50 hover:text-white")}>{f}</button>
        ))}
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} empty={{ title: "No invoices" }} />
    </div>
  );
}
