import { Invoice } from "@/lib/db/models/Invoice";
import { Installation } from "@/lib/db/models/Installation";
import { Employee } from "@/lib/db/models/Employee";
import { requireCap, json, errorResponse } from "@/lib/api/http";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type InvLean = {
  amount: number;
  cost?: number;
  paid: number;
  status: string;
  date: Date;
  employeeId?: { toString(): string } | null;
};

/**
 * Accurate operational analytics. Profit is real: for every approved invoice
 * profit = amount − cost (cost is the goods/materials cost captured on the
 * invoice). No fixed-percentage estimates. Also returns a per-employee
 * breakdown attributed via invoice.employeeId and installation.employeeIds.
 */
export async function GET() {
  try {
    await requireCap("reports.view");
    await connectMongo();

    const [invoices, installations, employees] = await Promise.all([
      Invoice.find({ ...notDeleted }).select("amount cost paid status date employeeId").lean() as Promise<InvLean[]>,
      Installation.find({ ...notDeleted }).select("status amount employeeId employeeIds").lean(),
      Employee.find({ ...notDeleted }).select("name title active rating assigned completed").lean(),
    ]);

    const approved = invoices.filter((i) => i.status === "approved");

    // ── company totals (accurate) ──
    const revenue = approved.reduce((s, i) => s + (i.amount || 0), 0);
    const cost = approved.reduce((s, i) => s + (i.cost || 0), 0);
    const profit = revenue - cost;
    const margin = revenue > 0 ? profit / revenue : 0;
    const collected = invoices.reduce((s, i) => s + (i.paid || 0), 0);
    const outstanding = invoices.reduce((s, i) => s + Math.max(0, (i.amount || 0) - (i.paid || 0)), 0);
    const costCoverage = approved.length
      ? approved.filter((i) => (i.cost || 0) > 0).length / approved.length
      : 0;

    // ── 12-month series (revenue / cost / profit) ──
    const now = new Date();
    const months: { key: string; label: string; revenue: number; cost: number; profit: number }[] = [];
    for (let k = 11; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()], revenue: 0, cost: 0, profit: 0 });
    }
    const monthIndex = new Map(months.map((m, i) => [m.key, i]));
    for (const i of approved) {
      const d = new Date(i.date);
      const idx = monthIndex.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (idx == null) continue;
      months[idx].revenue += i.amount || 0;
      months[idx].cost += i.cost || 0;
      months[idx].profit += (i.amount || 0) - (i.cost || 0);
    }

    // ── per-employee breakdown ──
    const empMap = new Map(
      employees.map((e) => [
        String(e._id),
        {
          id: String(e._id),
          name: e.name,
          title: e.title,
          active: e.active,
          rating: e.rating ?? 0,
          revenue: 0,
          cost: 0,
          profit: 0,
          invoices: 0,
          jobs: 0,
          completed: 0,
          inProgress: 0,
        },
      ])
    );

    for (const i of approved) {
      const eid = i.employeeId ? String(i.employeeId) : null;
      if (!eid) continue;
      const e = empMap.get(eid);
      if (!e) continue;
      e.revenue += i.amount || 0;
      e.cost += i.cost || 0;
      e.profit += (i.amount || 0) - (i.cost || 0);
      e.invoices += 1;
    }

    for (const inst of installations) {
      const ids = new Set<string>();
      if (inst.employeeId) ids.add(String(inst.employeeId));
      (inst.employeeIds || []).forEach((x) => ids.add(String(x)));
      ids.forEach((eid) => {
        const e = empMap.get(eid);
        if (!e) return;
        e.jobs += 1;
        if (inst.status === "completed") e.completed += 1;
        if (inst.status === "in_progress") e.inProgress += 1;
      });
    }

    const perEmployee = Array.from(empMap.values())
      .map((e) => ({
        ...e,
        margin: e.revenue > 0 ? e.profit / e.revenue : 0,
        avgInvoice: e.invoices > 0 ? Math.round(e.revenue / e.invoices) : 0,
        completionRate: e.jobs > 0 ? e.completed / e.jobs : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const byStatus = installations.reduce<Record<string, number>>((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, {});

    return json({
      totals: {
        revenue,
        cost,
        profit,
        margin,
        collected,
        outstanding,
        approvedInvoices: approved.length,
        totalInvoices: invoices.length,
        costCoverage, // fraction of approved invoices that have a cost recorded
        jobs: installations.length,
        completed: byStatus.completed || 0,
      },
      byStatus,
      months,
      employees: perEmployee,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
