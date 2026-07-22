"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send, RotateCw } from "lucide-react";
import toast from "react-hot-toast";
import Icon from "@/components/ui/Icon";
import { PageHeader } from "@/components/admin/ui/feedback";
import {
  Card,
  Badge,
  Button,
  Input,
  Label,
} from "@/components/admin/ui/primitives";
import Modal from "@/components/admin/ui/Modal";
import { api } from "@/lib/admin/services";
import {
  toastForWhatsAppResult,
  openWhatsAppUrl,
} from "@/lib/admin/whatsapp-client";
import { cn } from "@/lib/utils";

const S: Record<string, string> = {
  delivered: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  read: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  failed: "text-red-300 border-red-400/30 bg-red-400/10",
  sent: "text-white/60 border-white/15 bg-white/5",
  queued: "text-amber-300 border-amber-400/30 bg-amber-400/10",
};

const TEMPLATE_ICONS: Record<string, string> = {
  Invoice: "ReceiptText",
  Receipt: "Receipt",
  "Payment Reminder": "BellRing",
  "Installation Completed": "CheckCheck",
  "Installation Approved": "BadgeCheck",
  "Ledger Statement": "BookOpen",
  "Warranty Reminder": "ShieldCheck",
  Quotation: "FileText",
};

export default function WhatsAppPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState("payment_reminder");
  const [label, setLabel] = useState("Payment Reminder");
  const [channel, setChannel] = useState<"direct" | "business">("direct");
  const [toName, setToName] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp"],
    queryFn: () => api.whatsapp({ limit: 50 }),
  });

  const send = useMutation({
    mutationFn: () =>
      api.sendWhatsapp({
        toName,
        toPhone,
        template: label,
        event,
        channel,
        body: body || undefined,
      }),
    onError: (e: Error) => toast.error(e.message),
  });

  const onSend = () => {
    send.mutate(undefined, {
      onSuccess: (res) => {
        qc.invalidateQueries({ queryKey: ["whatsapp"] });
        setOpen(false);
        toast.success(toastForWhatsAppResult(res, () => void api.tickJobs()));
      },
    });
  };

  const retry = useMutation({
    mutationFn: (id: string) => api.retryWhatsapp(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp"] });
      toast.success("Retry queued");
      void api.tickJobs();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const templates = (data?.templates ?? []).map((t) =>
    typeof t === "string" ? { event: t, label: t } : t,
  );
  const history = data?.items ?? [];
  const fromPhone = data?.fromPhone || "";
  const sendMode = data?.sendMode || "direct";
  const businessReady = !!data?.businessApiReady;

  return (
    <div>
      <PageHeader
        title="WhatsApp"
        subtitle="Direct template messages now · Business API when you add Meta credentials later."
      />
      <Card className="mb-6 space-y-2 border-[#25D366]/25 bg-[#25D366]/5 p-4 text-sm text-white/80">
        <div>
          <span className="text-white/50">Business number · </span>
          <span className="font-medium text-[#25D366]">{fromPhone}</span>
        </div>
        <div className="text-xs text-white/45">
          Default mode: <span className="text-white/70">{sendMode}</span>
          {" · "}
          Business API:{" "}
          <span
            className={businessReady ? "text-emerald-300" : "text-amber-300"}
          >
            {businessReady
              ? "configured"
              : "not configured (direct will be used)"}
          </span>
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t, i) => (
          <motion.div
            key={t.event}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#25D366]/15 text-[#25D366] ring-1 ring-[#25D366]/20">
                  <Icon
                    name={TEMPLATE_ICONS[t.label] || "MessageSquare"}
                    className="h-5 w-5"
                  />
                </span>
                <div>
                  <span className="block text-sm text-white">{t.label}</span>
                  <span className="text-[0.65rem] text-white/35">
                    {t.event}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setEvent(t.event);
                  setLabel(t.label);
                  setChannel(sendMode);
                  setBody("");
                  setOpen(true);
                }}
                className="grid h-9 w-9 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
              >
                <Send className="h-4 w-4" />
              </button>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <h3 className="mb-4 text-sm font-medium text-white/80">
          Message history
        </h3>
        {isLoading ? (
          <div className="text-sm text-white/40">Loading…</div>
        ) : history.length === 0 ? (
          <div className="text-sm text-white/40">No messages yet.</div>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <div className="text-sm text-white">
                    {h.to || h.toName} ·{" "}
                    <span className="text-white/50">{h.template}</span>
                  </div>
                  <div className="text-xs text-white/40">
                    {(h as { channel?: string }).channel === "business"
                      ? "Business API"
                      : "Direct"}
                    {" · "}
                    From {h.from || h.fromPhone || fromPhone}
                    {h.at ? ` · ${new Date(h.at).toLocaleString()}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(h as { waUrl?: string }).waUrl && (
                    <button
                      onClick={() =>
                        openWhatsAppUrl((h as { waUrl?: string }).waUrl)
                      }
                      className="text-xs text-[#25D366] hover:underline"
                    >
                      Open
                    </button>
                  )}
                  <Badge className={S[h.status] || S.sent}>
                    <span className="capitalize">{h.status}</span>
                  </Badge>
                  {h.status === "failed" && (
                    <button
                      onClick={() => retry.mutate(h.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Send · ${label}`}
      >
        <div className="space-y-4">
          <div>
            <Label>Send via</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel("direct")}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-xs transition-colors",
                  channel === "direct"
                    ? "border-[#25D366]/40 bg-[#25D366]/15 text-[#25D366]"
                    : "border-white/10 bg-white/5 text-white/55 hover:text-white",
                )}
              >
                <div className="font-medium">Direct WhatsApp</div>
                <div className="mt-0.5 opacity-70">
                  Opens the WhatsApp app with the message
                </div>
              </button>
              <button
                type="button"
                onClick={() => setChannel("business")}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-xs transition-colors",
                  channel === "business"
                    ? "border-cyan/40 bg-cyan/15 text-cyan"
                    : "border-white/10 bg-white/5 text-white/55 hover:text-white",
                )}
              >
                <div className="font-medium">Business API</div>
                <div className="mt-0.5 opacity-70">
                  {businessReady ? "Meta Cloud queue" : "Not configured yet"}
                </div>
              </button>
            </div>
          </div>
          <div>
            <Label>Recipient name</Label>
            <Input
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              placeholder="Customer name"
            />
          </div>
          <div>
            <Label>Customer WhatsApp</Label>
            <Input
              value={toPhone}
              onChange={(e) => setToPhone(e.target.value)}
              placeholder="+92…"
            />
          </div>
          <div>
            <Label>Custom body (optional)</Label>
            <Input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Leave blank to use event template"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!toName || !toPhone || send.isPending}
              onClick={onSend}
            >
              {send.isPending
                ? "Sending…"
                : channel === "direct"
                  ? "Open in WhatsApp app"
                  : "Queue Business API"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
