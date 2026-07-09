"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Star } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Badge } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import { api } from "@/lib/admin/services";
import type { Employee } from "@/lib/admin/types";

export default function EmployeesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["employees"], queryFn: api.employees });
  const columns: ColumnDef<Employee>[] = [
    { accessorKey: "name", header: "Employee", cell: (i) => <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-electric to-cyan text-xs font-bold text-white">{i.row.original.name.split(" ").map((s) => s[0]).slice(0,2).join("")}</span><div><div className="font-medium text-white">{i.row.original.name}</div><div className="text-xs text-white/40">{i.row.original.title}</div></div></div> },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "assigned", header: "Assigned" },
    { accessorKey: "completed", header: "Completed" },
    { accessorKey: "rating", header: "Rating", cell: (i) => <span className="inline-flex items-center gap-1 text-white/80"><Star className="h-3.5 w-3.5 fill-solar text-solar" />{i.getValue<number>()}</span> },
    { accessorKey: "active", header: "Status", cell: (i) => i.getValue<boolean>() ? <Badge className="text-emerald-300 border-emerald-400/30 bg-emerald-400/10">Active</Badge> : <Badge className="text-white/50">Inactive</Badge> },
  ];
  return (
    <div>
      <PageHeader title="Employees" subtitle="Manage your team, assignments and performance."
        actions={<Button onClick={() => toast.success("Create employee — details, role & credentials")}><Plus className="h-4 w-4" /> Add Employee</Button>} />
      <DataTable columns={columns} data={data ?? []} loading={isLoading} onRowClick={(e) => toast(`${e.name}: ${e.assigned} assigned · ${e.completed} completed`)} empty={{ title: "No employees" }} />
    </div>
  );
}
