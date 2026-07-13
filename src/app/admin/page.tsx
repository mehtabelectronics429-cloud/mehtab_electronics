"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { PageHeader, StatCard, StatusBadge } from "@/components/admin/ui/feedback";
import { Card } from "@/components/admin/ui/primitives";
import { BarChart, LineChart } from "@/components/admin/ui/charts";
import { useAuth } from "@/lib/admin/auth";
import { api } from "@/lib/admin/services";
import { pkr } from "@/lib/admin/format";
import * as db from "@/lib/admin/mock-data";
import { formatDistanceToNow } from "date-fns";

const KIND_ICON: Record<string, string> = {
  install: "Wrench",
  invoice: "ReceiptText",
  payment: "Wallet",
  stock: "PackageMinus",
  customer: "UserPlus",
  approval: "CheckCheck",
  whatsapp: "MessageCircle",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const { data: installs } = useQuery({
    queryKey: ["installations", "dash"],
    queryFn: () => api.installations({ limit: 10 }),
  });

  const k = data?.kpis ?? {
    todayInstalls: 0,
    pendingInstalls: 0,
    completedInstalls: 0,
    pendingApproval: 0,
    revenue: 0,
    outstanding: 0,
    expenses: 0,
    inventoryValue: 0,
    lowStock: 0,
    pendingWhatsapp: 0,
  };

  const adminStats = [
    { label: "Today's Installations", value: String(k.todayInstalls), icon: "CalendarClock", accent: "cyan" },
    { label: "Pending Installations", value: String(k.pendingInstalls), icon: "Clock", accent: "solar" },
    { label: "Completed", value: String(k.completedInstalls), icon: "CheckCheck", accent: "energy" },
    { label: "Pending Approval", value: String(k.pendingApproval), icon: "ShieldQuestion", accent: "solar" },
    { label: "Revenue", value: pkr(k.revenue), icon: "TrendingUp", accent: "energy" },
    { label: "Outstanding", value: pkr(k.outstanding), icon: "AlertCircle", accent: "red" },
    { label: "Expenses", value: pkr(k.expenses), icon: "TrendingDown", accent: "electric" },
    { label: "Low Stock", value: String(k.lowStock), icon: "PackageMinus", accent: "red" },
    { label: "Pending WhatsApp", value: String(k.pendingWhatsapp), icon: "MessageCircle", accent: "energy" },
  ];

  const mine = installs?.items ?? [];
  const empStats = [
    { label: "Assigned to me", value: String(mine.length), icon: "Wrench", accent: "cyan" },
    {
      label: "In Progress",
      value: String(mine.filter((i) => i.status === "in_progress").length),
      icon: "Loader",
      accent: "solar",
    },
    {
      label: "Awaiting Approval",
      value: String(mine.filter((i) => i.status === "submitted").length),
      icon: "ShieldQuestion",
      accent: "electric",
    },
    {
      label: "Completed",
      value: String(mine.filter((i) => i.status === "completed").length),
      icon: "CheckCheck",
      accent: "energy",
    },
  ];

  const activity = data?.activity?.length ? data.activity : db.ACTIVITY;

  return (
    <div>
      <PageHeader
        title={isAdmin ? `Welcome back, ${user?.name.split(" ")[0]}` : `Hi, ${user?.name.split(" ")[0]}`}
        subtitle={
          isAdmin ? "Here's what's happening across operations today." : "Your assigned work and recent activity."
        }
      />

      <div
        className={`grid gap-4 ${isAdmin ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-4"}`}
      >
        {(isAdmin ? adminStats : empStats).map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {isAdmin && (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <BarChart title="Monthly Installations" data={db.MONTHLY_INSTALLS} labels={db.MONTHS} accent="#22E0FF" />
            <LineChart
              title="Revenue vs Expenses (PKR M)"
              labels={db.MONTHS}
              series={[
                { data: db.MONTHLY_REVENUE, color: "#38F6A4", name: "Revenue" },
                { data: db.MONTHLY_EXPENSES, color: "#FF8A34", name: "Expenses" },
              ]}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="p-5">
                <h3 className="text-sm font-medium text-white/80">Recent Activity</h3>
                <div className="mt-4 space-y-1">
                  {activity.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-white/5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-cyan ring-1 ring-white/10">
                        <Icon name={KIND_ICON[a.kind] ?? "Dot"} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white/80">
                          <b className="font-medium text-white">{a.actor}</b> {a.action}{" "}
                          <b className="font-medium text-white">{a.target}</b>
                        </p>
                        <p className="text-xs text-white/40">
                          {formatDistanceToNow(new Date(a.at), { addSuffix: true })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
            <Card className="p-5">
              <h3 className="text-sm font-medium text-white/80">Pending Approvals</h3>
              <div className="mt-4 space-y-2">
                {(installs?.items ?? [])
                  .filter((i) => i.status === "submitted" || i.status === "assigned")
                  .slice(0, 4)
                  .map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                    >
                      <div>
                        <div className="text-sm text-white">{i.ref}</div>
                        <div className="text-xs text-white/40">{i.customer}</div>
                      </div>
                      <StatusBadge status={i.status} />
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {!isAdmin && (
        <Card className="mt-6 p-5">
          <h3 className="text-sm font-medium text-white/80">My Upcoming Installations</h3>
          <div className="mt-4 space-y-2">
            {mine.length === 0 ? (
              <p className="text-sm text-white/40">No assigned installations.</p>
            ) : (
              mine.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <div className="text-sm text-white">
                      {i.ref} · {i.type}
                    </div>
                    <div className="text-xs text-white/40">
                      {i.customer} · {i.date}
                    </div>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
