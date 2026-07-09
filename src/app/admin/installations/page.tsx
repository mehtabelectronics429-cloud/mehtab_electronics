"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, StatusBadge } from "@/components/admin/ui/feedback";
import { Button } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import { api } from "@/lib/admin/services";
import { useAuth } from "@/lib/admin/auth";
import { pkr } from "@/lib/admin/format";
import type { Installation, InstallationStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const FILTERS: (InstallationStatus | "all")[] = ["all", "pending", "assigned", "in_progress", "submitted", "approved", "completed", "rejected"];

export default function InstallationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data, isLoading } = useQuery({ queryKey: ["installations"], queryFn: api.installations });
  const [status, setStatus] = useState<InstallationStatus | "all">("all");

  const rows = useMemo(() => {
    let r = data ?? [];
    if (!isAdmin) r = r.filter((i) => i.employee === user?.name);
    if (status !== "all") r = r.filter((i) => i.status === status);
    return r;
  }, [data, status, isAdmin, user]);

  const columns: ColumnDef<Installation>[] = [
    { accessorKey: "ref", header: "Ref", cell: (i) => <span className="font-medium text-white">{i.getValue<string>()}</span> },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "type", header: "Type" },
    ...(isAdmin ? [{ accessorKey: "employee", header: "Technician" } as ColumnDef<Installation>] : []),
    { accessorKey: "date", header: "Date" },
    { accessorKey: "amount", header: "Amount", cell: (i) => pkr(i.getValue<number>()) },
    { accessorKey: "status", header: "Status", cell: (i) => <StatusBadge status={i.getValue<string>()} /> },
  ];

  return (
    <div>
      <PageHeader title={isAdmin ? "Installations" : "My Installations"} subtitle={isAdmin ? "Create, assign and track every installation through its workflow." : "Your assigned jobs and their current status."}
        actions={isAdmin ? <Button onClick={() => toast.success("Installation wizard — assign customer, technician, products & materials")}><Plus className="h-4 w-4" /> New Installation</Button> : undefined} />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setStatus(f)} className={cn("rounded-full border px-3 py-1.5 text-xs capitalize transition-colors", status === f ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-white/50 hover:text-white")}>
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={rows} loading={isLoading} onRowClick={(r) => toast(`Opening ${r.ref} — photos, materials, invoice & approval`)}
        empty={{ title: "No installations", body: isAdmin ? "Create an installation to assign work." : "You have no assigned installations yet." }} />
    </div>
  );
}
