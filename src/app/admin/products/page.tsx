"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Button, Badge } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import type { Product } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["products"], queryFn: api.products });
  const [cat, setCat] = useState("All");
  const cats = useMemo(() => ["All", ...Array.from(new Set((data ?? []).map((p) => p.category)))], [data]);
  const rows = useMemo(() => (data ?? []).filter((p) => cat === "All" || p.category === cat), [data, cat]);

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "model", header: "Product", cell: (i) => <div><div className="font-medium text-white">{i.row.original.brand} {i.row.original.model}</div><div className="text-xs text-white/40">{i.row.original.sku}</div></div> },
    { accessorKey: "category", header: "Category", cell: (i) => <Badge>{i.getValue<string>()}</Badge> },
    { accessorKey: "purchasePrice", header: "Cost", cell: (i) => pkr(i.getValue<number>()) },
    { accessorKey: "sellingPrice", header: "Price", cell: (i) => <span className="text-white">{pkr(i.getValue<number>())}</span> },
    { accessorKey: "warranty", header: "Warranty" },
    { accessorKey: "stock", header: "Stock", cell: (i) => <span className={i.getValue<number>() <= 5 ? "text-red-300" : "text-white/70"}>{i.getValue<number>()}</span> },
  ];

  return (
    <div>
      <PageHeader title="Products" subtitle="Catalogue of solar, security and networking equipment."
        actions={<Button onClick={() => toast.success("Add product — category, pricing, warranty & stock")}><Plus className="h-4 w-4" /> Add Product</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={cn("rounded-full border px-3 py-1.5 text-xs transition-colors", cat === c ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-white/10 bg-white/5 text-white/50 hover:text-white")}>{c}</button>)}
      </div>
      <DataTable columns={columns} data={rows} loading={isLoading} empty={{ title: "No products" }} />
    </div>
  );
}
