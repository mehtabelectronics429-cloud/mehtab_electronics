"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { Download, Search } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Badge, Button, Input } from "@/components/admin/ui/primitives";
import DataTable from "@/components/admin/ui/DataTable";
import { api } from "@/lib/admin/services";
import { pkr, num } from "@/lib/admin/format";
import type { Product } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [lowOnly, setLowOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", page, q],
    queryFn: () =>
      api.products({
        page,
        limit: lowOnly ? 100 : 10,
        sort: "stock",
        q: q || undefined,
      }),
  });

  const items = useMemo(() => {
    const list = data?.items ?? [];
    return lowOnly ? list.filter((p) => p.stock <= 5) : list;
  }, [data, lowOnly]);

  const low = useMemo(
    () => (data?.items ?? []).filter((p) => p.stock <= 5).length,
    [data],
  );

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "model",
      header: "Item",
      cell: (i) => (
        <div>
          <div className="font-medium text-[var(--admin-fg)]">
            {i.row.original.brand} {i.row.original.model}
          </div>
          <div className="text-xs text-[var(--admin-muted)]">
            {i.row.original.sku}
          </div>
        </div>
      ),
    },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "stock",
      header: "Qty",
      cell: (i) => (
        <span
          className={
            i.getValue<number>() <= 5
              ? "font-medium text-red-300"
              : "text-[var(--admin-fg)]"
          }
        >
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
          <Badge className="border-red-400/30 bg-red-400/10 text-red-300">
            Low
          </Badge>
        ) : (
          <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
            OK
          </Badge>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${low} low-stock item${low === 1 ? "" : "s"} on this page · live product stock`}
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              api.downloadProductsCsv({ q: q || undefined })
            }
          >
            <Download className="h-4 w-4" /> Export CSV
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
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setLowOnly((v) => !v);
            setPage(1);
          }}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs transition-colors",
            lowOnly
              ? "border-cyan/40 bg-cyan/10 text-cyan"
              : "border-white/10 bg-white/5 text-white/50 hover:text-white",
          )}
        >
          Low stock only
        </button>
      </div>
      <DataTable
        columns={columns}
        data={items}
        loading={isLoading}
        page={lowOnly ? undefined : data?.page}
        totalPages={lowOnly ? undefined : data?.totalPages}
        total={lowOnly ? items.length : data?.total}
        onPageChange={lowOnly ? undefined : setPage}
        empty={{ title: "No inventory" }}
      />
    </div>
  );
}
