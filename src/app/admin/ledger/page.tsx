"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Badge } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import { api } from "@/lib/admin/services";
import { useAuth } from "@/lib/admin/auth";
import { pkr } from "@/lib/admin/format";
import type { LedgerEntry } from "@/lib/admin/types";

export default function LedgerPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data, isLoading } = useQuery({ queryKey: ["ledger"], queryFn: api.ledger });

  const columns: ColumnDef<LedgerEntry>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "type", header: "Type", cell: (i) => <Badge className="capitalize">{i.getValue<string>()}</Badge> },
    { accessorKey: "amount", header: "Amount", cell: (i) => <span className={i.getValue<number>() < 0 ? "text-emerald-300" : "text-white"}>{pkr(i.getValue<number>())}</span> },
    { accessorKey: "status", header: "Status", cell: (i) => i.getValue<string>() === "approved" ? <Badge className="text-emerald-300 border-emerald-400/30 bg-emerald-400/10">Approved</Badge> : <Badge className="text-amber-300 border-amber-400/30 bg-amber-400/10">Pending</Badge> },
    ...(isAdmin ? [{ id: "act", header: "", cell: (i: any) => i.row.original.status === "pending" ? <button onClick={() => toast.success("Ledger entry approved")} className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300"><Check className="h-3.5 w-3.5" /> Approve</button> : null } as ColumnDef<LedgerEntry>] : []),
  ];

  return (
    <div>
      <PageHeader title={isAdmin ? "Ledger" : "My Ledger"} subtitle="Customer balances, payments and adjustments. Entries stay pending until approved." />
      <DataTable columns={columns} data={data ?? []} loading={isLoading} empty={{ title: "No ledger entries" }} />
    </div>
  );
}
