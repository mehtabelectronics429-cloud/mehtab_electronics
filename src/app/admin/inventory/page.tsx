"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatCard } from "@/components/admin/ui/feedback";
import { Card } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { api } from "@/lib/admin/services";
import { pkr, num } from "@/lib/admin/format";
import type { Product } from "@/lib/admin/types";

export default function InventoryPage() {
  const { data, isLoading } = useQuery({ queryKey: ["products"], queryFn: api.products });
  const products = data ?? [];
  const value = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
  const units = products.reduce((s, p) => s + p.stock, 0);
  const low = products.filter((p) => p.stock <= 5);

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "model", header: "Product", cell: (i) => `${i.row.original.brand} ${i.row.original.model}` },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "stock", header: "Units left", cell: (i) => <span className="text-red-300">{i.getValue<number>()}</span> },
  ];

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Stock levels and valuation across the catalogue." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Inventory Value" value={pkr(value)} icon="Warehouse" accent="cyan" index={0} />
        <StatCard label="Total Units" value={num(units)} icon="Boxes" accent="energy" index={1} />
        <StatCard label="Low Stock SKUs" value={String(low.length)} icon="PackageMinus" accent="red" index={2} />
      </div>
      <Card className="mt-6 p-5">
        <h3 className="mb-4 text-sm font-medium text-white/80">Low stock alerts</h3>
        <DataTable columns={columns} data={low} loading={isLoading} empty={{ title: "All good", body: "No products are below the reorder threshold." }} />
      </Card>
    </div>
  );
}
