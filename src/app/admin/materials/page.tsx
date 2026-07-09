"use client";

import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Badge } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import { api } from "@/lib/admin/services";
import type { Material } from "@/lib/admin/types";

const avail = (m: Material) => m.opening - m.used - m.damaged;

export default function MaterialsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["materials"], queryFn: api.materials });
  const columns: ColumnDef<Material>[] = [
    { accessorKey: "name", header: "Material", cell: (i) => <span className="font-medium text-white">{i.row.original.name} <span className="text-white/40">({i.row.original.unit})</span></span> },
    { accessorKey: "opening", header: "Opening" },
    { accessorKey: "issued", header: "Issued" },
    { accessorKey: "used", header: "Used" },
    { accessorKey: "returned", header: "Returned" },
    { accessorKey: "damaged", header: "Damaged" },
    { id: "available", header: "Available", cell: (i) => <span className="font-medium text-white">{avail(i.row.original)}</span> },
    { id: "status", header: "Status", cell: (i) => avail(i.row.original) <= i.row.original.reorder ? <Badge className="text-red-300 border-red-400/30 bg-red-400/10">Low stock</Badge> : <Badge className="text-emerald-300 border-emerald-400/30 bg-emerald-400/10">OK</Badge> },
  ];
  return (
    <div>
      <PageHeader title="Materials" subtitle="Track installation materials — issued, used, returned and damaged."
        actions={<Button onClick={() => toast.success("Add material & set reorder level")}><Plus className="h-4 w-4" /> Add Material</Button>} />
      <DataTable columns={columns} data={data ?? []} loading={isLoading} empty={{ title: "No materials tracked" }} />
    </div>
  );
}
