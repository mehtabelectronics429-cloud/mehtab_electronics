"use client";

import { useState } from "react";
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { Skeleton } from "./primitives";
import { EmptyState } from "./feedback";

export default function DataTable<T>({ columns, data, loading, onRowClick, empty }: {
  columns: ColumnDef<T, any>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  empty?: { title: string; body?: string; action?: React.ReactNode };
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data, columns, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
      </div>
    );
  }
  if (!data.length) {
    return <EmptyState icon="Inbox" title={empty?.title ?? "Nothing here yet"} body={empty?.body} action={empty?.action} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-white/10">
                {hg.headers.map((h) => (
                  <th key={h.id} onClick={h.column.getToggleSortingHandler()} className="cursor-pointer select-none px-4 py-3 text-left text-[0.7rem] font-medium uppercase tracking-wider text-white/40 hover:text-white/70">
                    <span className="inline-flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getCanSort() && <ChevronsUpDown className="h-3 w-3 opacity-40" />}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} onClick={() => onRowClick?.(row.original)} className={`border-b border-white/[0.06] transition-colors hover:bg-white/[0.03] ${onRowClick ? "cursor-pointer" : ""}`}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-white/80">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
