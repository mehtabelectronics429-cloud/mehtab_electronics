"use client";

import { motion } from "framer-motion";
import { Send, RotateCw } from "lucide-react";
import toast from "react-hot-toast";
import Icon from "@/components/ui/Icon";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Card, Badge } from "@/components/admin/ui/primitives";

const TEMPLATES = [
  { name: "Invoice", icon: "ReceiptText" }, { name: "Receipt", icon: "Receipt" },
  { name: "Payment Reminder", icon: "BellRing" }, { name: "Installation Completed", icon: "CheckCheck" },
  { name: "Warranty Reminder", icon: "ShieldCheck" }, { name: "Quotation", icon: "FileText" },
];
const HISTORY = [
  { to: "Ayesha Khan", template: "Invoice", at: "Today 09:20", status: "delivered" },
  { to: "Sana Malik", template: "Payment Reminder", at: "Today 08:10", status: "read" },
  { to: "Bilal Ahmed", template: "Installation Completed", at: "Yesterday", status: "failed" },
  { to: "Usman Tariq", template: "Quotation", at: "Yesterday", status: "sent" },
];
const S: Record<string, string> = { delivered: "text-sky-300 border-sky-400/30 bg-sky-400/10", read: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10", failed: "text-red-300 border-red-400/30 bg-red-400/10", sent: "text-white/60 border-white/15 bg-white/5" };

export default function WhatsAppPage() {
  return (
    <div>
      <PageHeader title="WhatsApp" subtitle="Automated customer messaging after approvals — templates, history and delivery status." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#25D366]/15 text-[#25D366] ring-1 ring-[#25D366]/20"><Icon name={t.icon} className="h-5 w-5" /></span>
                <span className="text-sm text-white">{t.name}</span>
              </div>
              <button onClick={() => toast.success(`${t.name} template ready to send`)} className="grid h-9 w-9 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"><Send className="h-4 w-4" /></button>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <h3 className="mb-4 text-sm font-medium text-white/80">Message history</h3>
        <div className="space-y-2">
          {HISTORY.map((h, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div><div className="text-sm text-white">{h.to} · <span className="text-white/50">{h.template}</span></div><div className="text-xs text-white/40">{h.at}</div></div>
              <div className="flex items-center gap-2">
                <Badge className={S[h.status]}><span className="capitalize">{h.status}</span></Badge>
                {h.status === "failed" && <button onClick={() => toast.success("Retrying…")} className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"><RotateCw className="h-4 w-4" /></button>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
