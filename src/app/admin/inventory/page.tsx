"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Badge } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import { api } from "@/lib/admin/services";
import { pkr, num } from "@/lib/admin/format";
import type { Product } from "@/lib/admin/types";

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["inventory", page],
    queryFn: () => api.products({ page, limit: 10, sort: "stock" }),
  });

  const low = useMemo(() => (data?.items ?? []).filter((p) => p.stock <= 5).length, [data]);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "model",
      header: "Item",
      cell: (i) => (
        <div>
          <div className="font-medium text-white">
            {i.row.original.brand} {i.row.original.model}
          </div>
          <div className="text-xs text-white/40">{i.row.original.sku}</div>
        </div>
      ),
    },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "stock",
      header: "Qty",
      cell: (i) => (
        <span className={i.getValue<number>() <= 5 ? "font-medium text-red-300" : "text-white"}>
          {num(i.getValue<number>())}
        </span>
      ),
    },
    {
      id: "value",
      header: "Stock value",
      cell: (i) => pkr(i.row.original.stock * i.row.original.purchasePrice),
    },
    {
      id: "status",
      header: "Status",
      cell: (i) =>
        i.row.original.stock <= 5 ? (
          <Badge className="border-red-400/30 bg-red-400/10 text-red-300">Low</Badge>
        ) : (
          <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">OK</Badge>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${low} low-stock item${low === 1 ? "" : "s"} on this page · live product stock`}
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        page={data?.page}
        totalPages={data?.totalPages}
        total={data?.total}
        onPageChange={setPage}
        empty={{ title: "No inventory" }}
      />
    </div>
  );
}
