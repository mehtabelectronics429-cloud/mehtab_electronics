"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui/feedback";
import { LineChart, BarChart } from "@/components/admin/ui/charts";
import { Button, Card, Input } from "@/components/admin/ui/primitives";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function downloadReportsCsv(opts: {
  rangeLabel: string;
  totals?: Record<string, number>;
  employees: {
    name: string;
    title: string;
    revenue: number;
    profit: number;
    margin: number;
    invoices: number;
    jobs: number;
    completed: number;
  }[];
}) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const t = opts.totals ?? {};
  const rows = [
    ["Section", "Metric", "Value"].map(esc).join(","),
    ["Summary", "Range", opts.rangeLabel].map(esc).join(","),
    ["Summary", "Revenue", t.revenue ?? 0].map(esc).join(","),
    ["Summary", "Cost", t.cost ?? 0].map(esc).join(","),
    ["Summary", "Net Profit", t.profit ?? 0].map(esc).join(","),
    ["Summary", "Margin", t.margin ?? 0].map(esc).join(","),
    ["Summary", "Collected", t.collected ?? 0].map(esc).join(","),
    ["Summary", "Outstanding", t.outstanding ?? 0].map(esc).join(","),
    ["Summary", "Stock Purchased", t.purchaseTotal ?? 0].map(esc).join(","),
    ["Summary", "Paid to Suppliers", t.purchasePaid ?? 0].map(esc).join(","),
    ["Summary", "Supplier Payables", t.payable ?? 0].map(esc).join(","),
    ["Employees", "Name", "Title", "Revenue", "Profit", "Margin", "Invoices", "Jobs", "Completed"]
      .map(esc)
      .join(","),
    ...opts.employees.map((e) =>
      [
        "Employee",
        e.name,
        e.title,
        e.revenue,
        e.profit,
        e.margin,
        e.invoices,
        e.jobs,
        e.completed,
      ]
        .map(esc)
        .join(","),
    ),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reports-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mode, setMode] = useState<"overall" | "range">("overall");
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", mode, from, to],
    queryFn: () =>
      api.analytics({ mode, from: from || undefined, to: to || undefined }),
  });
  const t = data?.totals;
  const months = data?.months ?? [];
  const employees = data?.employees ?? [];

  const rangeLabel = useMemo(() => {
    if (mode === "overall") return "All-time";
    if (!from && !to) return "Custom range";
    if (from && to) return `${from} → ${to}`;
    return from ? `From ${from}` : `Until ${to}`;
  }, [from, to, mode]);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Accurate revenue, cost, profit and per-employee performance."
        actions={
          <Button
            variant="secondary"
            disabled={isLoading || !t}
            onClick={() =>
              downloadReportsCsv({
                rangeLabel,
                totals: t as Record<string, number> | undefined,
                employees,
              })
            }
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <Card className="mb-5 flex flex-col gap-3 border-white/10 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/40">
            Date range
          </div>
          <div className="mt-1 text-sm font-medium text-white">
            {rangeLabel}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={mode === "overall" ? "primary" : "secondary"}
            onClick={() => setMode("overall")}
          >
            Overall
          </Button>
          <Button
            type="button"
            variant={mode === "range" ? "primary" : "secondary"}
            onClick={() => setMode("range")}
          >
            Custom range
          </Button>
        </div>
        {mode === "range" && (
          <div className="flex flex-wrap gap-2">
            <label className="text-xs text-white/50">
              <span className="mb-1 block">From</span>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className="text-xs text-white/50">
              <span className="mb-1 block">To</span>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>
        )}
      </Card>

      {/* profit detailing */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Revenue"
          value={pkr(t?.revenue ?? 0)}
          icon="TrendingUp"
          accent="energy"
          index={0}
        />
        <StatCard
          label="Cost of Goods"
          value={pkr(t?.cost ?? 0)}
          icon="TrendingDown"
          accent="solar"
          index={1}
        />
        <StatCard
          label="Net Profit"
          value={pkr(t?.profit ?? 0)}
          icon="Wallet"
          accent="cyan"
          index={2}
        />
        <StatCard
          label="Margin"
          value={pct(t?.margin ?? 0)}
          icon="Percent"
          accent="energy"
          index={3}
        />
        <StatCard
          label="Collected"
          value={pkr(t?.collected ?? 0)}
          icon="CheckCheck"
          accent="cyan"
          index={4}
        />
        <StatCard
          label="Outstanding"
          value={pkr(t?.outstanding ?? 0)}
          icon="AlertCircle"
          accent="red"
          index={5}
        />
      </div>

      {/* purchasing / payables */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Stock Purchased"
          value={pkr(t?.purchaseTotal ?? 0)}
          icon="ShoppingBag"
          accent="solar"
          index={0}
        />
        <StatCard
          label="Paid to Suppliers"
          value={pkr(t?.purchasePaid ?? 0)}
          icon="Wallet"
          accent="cyan"
          index={1}
        />
        <StatCard
          label="Supplier Payables"
          value={pkr(t?.payable ?? 0)}
          icon="AlertCircle"
          accent="red"
          index={2}
        />
        <StatCard
          label="Cost Coverage"
          value={pct(t?.costCoverage ?? 0)}
          icon="Percent"
          accent="energy"
          index={3}
        />
      </div>

      {/* cost-coverage caveat so the numbers are honest */}
      {t != null && t.approvedInvoices > 0 && t.costCoverage < 1 && (
        <Card className="mt-4 border-amber-400/30 bg-amber-400/[0.06] p-3 text-xs text-amber-200/90">
          Profit is exact for invoices that have a cost recorded. Currently{" "}
          <b>{pct(t.costCoverage)}</b> of approved invoices have a cost entered
          add cost on the remaining invoices in Billing for fully accurate
          profit.
        </Card>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <LineChart
          title={
            mode === "range"
              ? `Revenue vs Profit (${rangeLabel})`
              : "Revenue vs Profit (last 12 months)"
          }
          labels={months.map((m) => m.label)}
          series={[
            {
              data: months.map((m) => Math.round(m.revenue)),
              color: "#34D399",
              name: "Revenue",
            },
            {
              data: months.map((m) => Math.round(m.profit)),
              color: "#EAB308",
              name: "Profit",
            },
          ]}
        />
        <BarChart
          title={mode === "range" ? `Cost (${rangeLabel})` : "Monthly Cost"}
          data={months.map((m) => Math.round(m.cost))}
          labels={months.map((m) => m.label)}
          accent="#FB923C"
        />
      </div>

      {/* per-employee performance */}
      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-medium text-white/80">
            Employee performance
          </h3>
          <p className="text-xs text-white/40">
            Revenue & profit attributed by invoice, jobs by installation
            assignment.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-3 py-3 font-medium">Jobs</th>
                <th className="px-3 py-3 font-medium">Completed</th>
                <th className="px-3 py-3 font-medium">Revenue</th>
                <th className="px-3 py-3 font-medium">Profit</th>
                <th className="px-3 py-3 font-medium">Margin</th>
                <th className="px-5 py-3 font-medium">Avg Invoice</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-white/40"
                  >
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && employees.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-white/40"
                  >
                    No employee data yet.
                  </td>
                </tr>
              )}
              {employees.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-white">{e.name}</div>
                    <div className="text-xs text-white/40">{e.title}</div>
                  </td>
                  <td className="px-3 py-3 text-white/70">{e.jobs}</td>
                  <td className="px-3 py-3 text-white/70">{e.completed}</td>
                  <td className="px-3 py-3 text-white/80">{pkr(e.revenue)}</td>
                  <td className="px-3 py-3 text-emerald-300">
                    {pkr(e.profit)}
                  </td>
                  <td className="px-3 py-3 text-white/70">{pct(e.margin)}</td>
                  <td className="px-5 py-3 text-white/70">
                    {pkr(e.avgInvoice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
