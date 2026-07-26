"use client";

import { motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { Card } from "./primitives";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--admin-fg)]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-[var(--admin-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

const ACCENT: Record<string, string> = {
  cyan: "text-cyan", electric: "text-electric", energy: "text-energy", solar: "text-solar", red: "text-red-400",
};

export function StatCard({ label, value, delta, icon, accent = "cyan", index = 0 }: {
  label: string; value: string; delta?: string; icon: string; accent?: string; index?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}>
      <Card className="group relative overflow-hidden p-5 transition-colors hover:border-white/20">
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--admin-muted)]">{label}</span>
          <span className={cn("grid h-8 w-8 place-items-center rounded-lg bg-white/5 ring-1 ring-white/10", ACCENT[accent])}>
            <Icon name={icon} className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-3 font-display text-2xl font-bold text-[var(--admin-fg)]">{value}</div>
        {delta && <div className="mt-1 text-xs text-[var(--admin-muted)]">{delta}</div>}
      </Card>
    </motion.div>
  );
}

export function EmptyState({ icon = "Inbox", title, body, action }: { icon?: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-cyan ring-1 ring-white/10"><Icon name={icon} className="h-6 w-6" /></span>
      <h3 className="mt-5 font-display text-base text-[var(--admin-fg)]">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm text-[var(--admin-muted)]">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "text-amber-300 border-amber-400/30 bg-amber-400/10" },
  assigned: { label: "Assigned", cls: "text-sky-300 border-sky-400/30 bg-sky-400/10" },
  in_progress: { label: "In Progress", cls: "text-cyan border-cyan/30 bg-cyan/10" },
  submitted: { label: "Submitted", cls: "text-violet-300 border-violet-400/30 bg-violet-400/10" },
  approved: { label: "Approved", cls: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10" },
  rejected: { label: "Rejected", cls: "text-red-300 border-red-400/30 bg-red-400/10" },
  completed: { label: "Completed", cls: "text-energy border-energy/30 bg-energy/10" },
  draft: { label: "Draft", cls: "text-white/60 border-white/15 bg-white/5" },
  unpaid: { label: "Unpaid", cls: "text-red-300 border-red-400/30 bg-red-400/10" },
  partial: { label: "Partial", cls: "text-amber-300 border-amber-400/30 bg-amber-400/10" },
  paid: { label: "Paid", cls: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: "text-white/60 border-white/15 bg-white/5" };
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium", s.cls)}>{s.label}</span>;
}
