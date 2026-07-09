"use client";

import { PageHeader, StatCard } from "@/components/admin/ui/feedback";
import { BarChart, LineChart } from "@/components/admin/ui/charts";
import { Card, Button } from "@/components/admin/ui/primitives";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import * as db from "@/lib/admin/mock-data";
import { pkr } from "@/lib/admin/format";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Revenue, expenses, inventory and performance analytics."
        actions={<Button variant="secondary" onClick={() => toast.success("Exporting report…")}><Download className="h-4 w-4" /> Export</Button>} />

      <Card className="mb-5 flex flex-wrap items-center gap-3 p-4">
        <select className="h-9 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none">
          <option className="bg-[#0c0e16]">Monthly Summary</option><option className="bg-[#0c0e16]">Revenue</option><option className="bg-[#0c0e16]">Expenses</option><option className="bg-[#0c0e16]">Employee Performance</option>
        </select>
        <select className="h-9 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none">
          <option className="bg-[#0c0e16]">This Year</option><option className="bg-[#0c0e16]">Last Quarter</option><option className="bg-[#0c0e16]">This Month</option>
        </select>
        <select className="h-9 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none">
          <option className="bg-[#0c0e16]">All Employees</option>{db.EMPLOYEES.map((e) => <option key={e.id} className="bg-[#0c0e16]">{e.name}</option>)}
        </select>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="YTD Revenue" value={pkr(db.KPIS.revenue)} icon="TrendingUp" accent="energy" index={0} />
        <StatCard label="YTD Expenses" value={pkr(db.KPIS.expenses)} icon="TrendingDown" accent="solar" index={1} />
        <StatCard label="Outstanding" value={pkr(db.KPIS.outstanding)} icon="AlertCircle" accent="red" index={2} />
        <StatCard label="Completed Jobs" value={String(db.KPIS.completedInstalls)} icon="CheckCheck" accent="cyan" index={3} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BarChart title="Monthly Installations" data={db.MONTHLY_INSTALLS} labels={db.MONTHS} />
        <LineChart title="Revenue vs Expenses (PKR M)" labels={db.MONTHS} series={[{ data: db.MONTHLY_REVENUE, color: "#38F6A4", name: "Revenue" }, { data: db.MONTHLY_EXPENSES, color: "#FF8A34", name: "Expenses" }]} />
      </div>
    </div>
  );
}
