"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatCard } from "@/components/admin/ui/feedback";
import { LineChart, BarChart } from "@/components/admin/ui/charts";
import { Card } from "@/components/admin/ui/primitives";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function ReportsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: api.analytics });
  const t = data?.totals;
  const months = data?.months ?? [];
  const employees = data?.employees ?? [];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Accurate revenue, cost, profit and per-employee performance." />

      {/* profit detailing */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Revenue" value={pkr(t?.revenue ?? 0)} icon="TrendingUp" accent="energy" index={0} />
        <StatCard label="Cost of Goods" value={pkr(t?.cost ?? 0)} icon="TrendingDown" accent="solar" index={1} />
        <StatCard label="Net Profit" value={pkr(t?.profit ?? 0)} icon="Wallet" accent="cyan" index={2} />
        <StatCard label="Margin" value={pct(t?.margin ?? 0)} icon="Percent" accent="energy" index={3} />
        <StatCard label="Collected" value={pkr(t?.collected ?? 0)} icon="CheckCheck" accent="cyan" index={4} />
        <StatCard label="Outstanding" value={pkr(t?.outstanding ?? 0)} icon="AlertCircle" accent="red" index={5} />
      </div>

      {/* cost-coverage caveat so the numbers are honest */}
      {t != null && t.approvedInvoices > 0 && t.costCoverage < 1 && (
        <Card className="mt-4 border-amber-400/30 bg-amber-400/[0.06] p-3 text-xs text-amber-200/90">
          Profit is exact for invoices that have a cost recorded. Currently{" "}
          <b>{pct(t.costCoverage)}</b> of approved invoices have a cost entered — add cost on the
          remaining invoices in Billing for fully accurate profit.
        </Card>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <LineChart
          title="Revenue vs Profit (last 12 months)"
          labels={months.map((m) => m.label)}
          series={[
            { data: months.map((m) => Math.round(m.revenue)), color: "#34D399", name: "Revenue" },
            { data: months.map((m) => Math.round(m.profit)), color: "#EAB308", name: "Profit" },
          ]}
        />
        <BarChart
          title="Monthly Cost"
          data={months.map((m) => Math.round(m.cost))}
          labels={months.map((m) => m.label)}
          accent="#FB923C"
        />
      </div>

      {/* per-employee performance */}
      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-medium text-white/80">Employee performance</h3>
          <p className="text-xs text-white/40">Revenue & profit attributed by invoice, jobs by installation assignment.</p>
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
                <tr><td colSpan={7} className="px-5 py-8 text-center text-white/40">Loading…</td></tr>
              )}
              {!isLoading && employees.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-white/40">No employee data yet.</td></tr>
              )}
              {employees.map((e) => (
                <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-5 py-3">
                    <div className="font-medium text-white">{e.name}</div>
                    <div className="text-xs text-white/40">{e.title}</div>
                  </td>
                  <td className="px-3 py-3 text-white/70">{e.jobs}</td>
                  <td className="px-3 py-3 text-white/70">{e.completed}</td>
                  <td className="px-3 py-3 text-white/80">{pkr(e.revenue)}</td>
                  <td className="px-3 py-3 text-emerald-300">{pkr(e.profit)}</td>
                  <td className="px-3 py-3 text-white/70">{pct(e.margin)}</td>
                  <td className="px-5 py-3 text-white/70">{pkr(e.avgInvoice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
