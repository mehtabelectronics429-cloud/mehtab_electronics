"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Card, Button, Input, Label, Textarea } from "@/components/admin/ui/primitives";
import { api } from "@/lib/admin/services";
import { cn } from "@/lib/utils";

const TABS = ["Company", "Invoice", "WhatsApp", "Taxes", "Branding"] as const;
type Tab = (typeof TABS)[number];

const KEYS: Record<Tab, string> = {
  Company: "company",
  Invoice: "invoice",
  WhatsApp: "whatsapp",
  Taxes: "taxes",
  Branding: "branding",
};

export default function SettingsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("Company");
  const [form, setForm] = useState<Record<string, string>>({});

  const { data } = useQuery({ queryKey: ["settings"], queryFn: api.settings });

  useEffect(() => {
    const key = KEYS[tab];
    const val = (data?.settings?.[key] as Record<string, string>) || {};
    setForm({ ...val });
  }, [data, tab]);

  const save = useMutation({
    mutationFn: () => api.saveSettings(KEYS[tab], form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader title="Settings" subtitle="Company profile, invoicing, WhatsApp and branding." />
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <div className="flex gap-2 overflow-x-auto lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm transition-colors",
                tab === t ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {tab === "Company" && (
              <>
                <div>
                  <Label>Company name</Label>
                  <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Address</Label>
                  <Textarea rows={2} value={form.address || ""} onChange={(e) => set("address", e.target.value)} />
                </div>
              </>
            )}
            {tab === "Invoice" && (
              <>
                <div>
                  <Label>Invoice prefix</Label>
                  <Input value={form.prefix || ""} onChange={(e) => set("prefix", e.target.value)} />
                </div>
                <div>
                  <Label>Next number</Label>
                  <Input value={form.nextNumber || ""} onChange={(e) => set("nextNumber", e.target.value)} />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input value={form.currency || ""} onChange={(e) => set("currency", e.target.value)} />
                </div>
                <div>
                  <Label>Due days</Label>
                  <Input value={form.dueDays || ""} onChange={(e) => set("dueDays", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Terms & conditions</Label>
                  <Textarea rows={3} value={form.terms || ""} onChange={(e) => set("terms", e.target.value)} />
                </div>
              </>
            )}
            {tab === "WhatsApp" && (
              <>
                <div className="sm:col-span-2 rounded-xl border border-[#25D366]/20 bg-[#25D366]/5 px-3 py-2 text-xs text-white/55">
                  <strong className="text-white/80">Direct</strong> opens WhatsApp with a prefilled template (works now).{" "}
                  <strong className="text-white/80">Business API</strong> queues to Meta Cloud API when credentials are set (future).
                </div>
                <div className="sm:col-span-2">
                  <Label>Default send mode</Label>
                  <select
                    value={form.sendMode || "direct"}
                    onChange={(e) => set("sendMode", e.target.value)}
                    className="admin-select h-10 w-full rounded-xl border border-white/10 bg-[#12151f] px-3 text-sm text-white outline-none"
                  >
                    <option value="direct">Direct WhatsApp (wa.me + template)</option>
                    <option value="business">WhatsApp Business API (Meta Cloud)</option>
                  </select>
                </div>
                <div>
                  <Label>Business number (from)</Label>
                  <Input
                    value={form.businessNumber || ""}
                    onChange={(e) => set("businessNumber", e.target.value)}
                    placeholder="+92 3XX XXXXXXX"
                  />
                </div>
                <div>
                  <Label>API provider</Label>
                  <Input value={form.provider || ""} onChange={(e) => set("provider", e.target.value)} placeholder="Meta Cloud API" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Default signature</Label>
                  <Textarea rows={2} value={form.signature || ""} onChange={(e) => set("signature", e.target.value)} />
                </div>
              </>
            )}
            {tab === "Taxes" && (
              <>
                <div>
                  <Label>GST %</Label>
                  <Input value={form.gst || ""} onChange={(e) => set("gst", e.target.value)} />
                </div>
                <div>
                  <Label>Withholding %</Label>
                  <Input value={form.withholding || ""} onChange={(e) => set("withholding", e.target.value)} />
                </div>
                <div>
                  <Label>NTN</Label>
                  <Input value={form.ntn || ""} onChange={(e) => set("ntn", e.target.value)} />
                </div>
              </>
            )}
            {tab === "Branding" && (
              <>
                <div>
                  <Label>Primary color</Label>
                  <Input value={form.primary || ""} onChange={(e) => set("primary", e.target.value)} />
                </div>
                <div>
                  <Label>Accent color</Label>
                  <Input value={form.accent || ""} onChange={(e) => set("accent", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Logo URL</Label>
                  <Input value={form.logoUrl || ""} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://…" />
                </div>
              </>
            )}
            <div className="sm:col-span-2 mt-2 flex justify-end">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
