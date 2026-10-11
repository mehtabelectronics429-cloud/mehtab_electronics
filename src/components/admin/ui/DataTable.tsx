"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "./primitives";
import { EmptyState } from "./feedback";
import { cn } from "@/lib/utils";

/** A column shows a label in the phone card layout only if it has a header. */
const hasHeader = (def: { header?: unknown }) => {
  const h = def.header;
  if (typeof h === "string") return h.trim().length > 0;
  if (h != null) return true;
  return "accessorKey" in def; // tanstack falls back to the key as the header
};

export default function DataTable<T>({
  columns,
  data,
  loading,
  onRowClick,
  empty,
  page,
  totalPages,
  total,
  onPageChange,
}: {
  columns: ColumnDef<T, any>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  empty?: { title: string; body?: string; action?: React.ReactNode };
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
  }
  if (!data.length) {
    return <EmptyState icon="Inbox" title={empty?.title ?? "Nothing here yet"} body={empty?.body} action={empty?.action} />;
  }

  const showPager = onPageChange && totalPages && totalPages > 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      {/* phones: one card per row, "label · value" lines; header-less columns (actions) sit at the bottom */}
      <ul className="divide-y divide-white/[0.06] md:hidden">
        {table.getRowModel().rows.map((row) => {
          const cells = row.getVisibleCells();
          const labelled = cells.filter((c) => hasHeader(c.column.columnDef));
          const bare = cells.filter((c) => !hasHeader(c.column.columnDef));
          const header = (id: string) => {
            const h = table.getFlatHeaders().find((x) => x.column.id === id);
            return h ? flexRender(h.column.columnDef.header, h.getContext()) : null;
          };
          return (
            <li
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={cn("px-4 py-3", onRowClick && "cursor-pointer active:bg-white/[0.03]")}
            >
              <div className="space-y-1.5">
                {labelled.map((cell, i) => (
                  <div
                    key={cell.id}
                    className={cn(
                      "flex items-start justify-between gap-3 text-sm",
                      i === 0 && "pb-0.5 font-medium",
                    )}
                  >
                    <span className="shrink-0 pt-0.5 text-[0.65rem] uppercase tracking-wider text-[var(--admin-muted)] [&_*]:!text-left">
                      {header(cell.column.id)}
                    </span>
                    <span className="min-w-0 text-right text-[var(--admin-fg)] [&>*]:ml-auto">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  </div>
                ))}
              </div>
              {bare.length > 0 && (
                <div
                  className="mt-2.5 flex flex-wrap items-center justify-end gap-1 border-t border-white/[0.06] pt-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {bare.map((cell) => (
                    <div key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* tablets / desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-white/10">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none bg-slate-100 px-4 py-3 text-left text-[0.7rem] font-semibold uppercase tracking-wider text-black hover:bg-slate-200/80 dark:bg-transparent dark:font-medium dark:text-white/40 dark:hover:bg-transparent dark:hover:text-white/70"
                  >
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
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  "border-b border-white/[0.06] transition-colors hover:bg-white/[0.03]",
                  onRowClick ? "cursor-pointer" : ""
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-[var(--admin-fg)]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPager && (
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-xs text-[var(--admin-muted)]">
          <span>
            Page {page} of {totalPages}
            {typeof total === "number" ? ` · ${total} total` : ""}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page! <= 1}
              onClick={() => onPageChange!(page! - 1)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 disabled:opacity-30 hover:bg-white/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page! >= totalPages!}
              onClick={() => onPageChange!(page! + 1)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 disabled:opacity-30 hover:bg-white/5"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
