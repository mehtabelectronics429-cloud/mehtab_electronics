"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/admin/ui/feedback";
import { Card, Button, Input, Label, Textarea } from "@/components/admin/ui/primitives";
import { cn } from "@/lib/utils";

const TABS = ["Company", "Invoice", "WhatsApp", "Taxes", "Branding"] as const;
type Tab = (typeof TABS)[number];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("Company");
  const save = (e: React.FormEvent) => { e.preventDefault(); toast.success("Settings saved"); };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Company profile, invoicing, WhatsApp and branding." />
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <div className="flex gap-2 overflow-x-auto lg:flex-col">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm transition-colors", tab === t ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white")}>{t}</button>
          ))}
        </div>

        <Card className="p-6">
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {tab === "Company" && (<>
              <div><Label>Company name</Label><Input defaultValue="Mehtab Electronics" /></div>
              <div><Label>Phone</Label><Input defaultValue="+92 300 1234567" /></div>
              <div><Label>Email</Label><Input defaultValue="hello@mehtabelectronics.pk" /></div>
              <div><Label>City</Label><Input defaultValue="Lahore" /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Textarea rows={2} defaultValue="Hall Road Electronics Market, Lahore, Pakistan" /></div>
            </>)}
            {tab === "Invoice" && (<>
              <div><Label>Invoice prefix</Label><Input defaultValue="INV-" /></div>
              <div><Label>Next number</Label><Input defaultValue="2045" /></div>
              <div><Label>Currency</Label><Input defaultValue="PKR" /></div>
              <div><Label>Due days</Label><Input defaultValue="15" /></div>
              <div className="sm:col-span-2"><Label>Terms & conditions</Label><Textarea rows={3} defaultValue="Payment due within 15 days. Warranty as per manufacturer." /></div>
            </>)}
            {tab === "WhatsApp" && (<>
              <div><Label>Business number</Label><Input defaultValue="+92 321 7654321" /></div>
              <div><Label>API provider</Label><Input defaultValue="Meta Cloud API" /></div>
              <div className="sm:col-span-2"><Label>Default signature</Label><Textarea rows={2} defaultValue="— Team Mehtab Electronics" /></div>
            </>)}
            {tab === "Taxes" && (<>
              <div><Label>GST %</Label><Input defaultValue="17" /></div>
              <div><Label>Withholding %</Label><Input defaultValue="4" /></div>
              <div><Label>NTN</Label><Input defaultValue="1234567-8" /></div>
            </>)}
            {tab === "Branding" && (<>
              <div><Label>Primary color</Label><Input defaultValue="#2E6BFF" /></div>
              <div><Label>Accent color</Label><Input defaultValue="#22E0FF" /></div>
              <div className="sm:col-span-2"><Label>Logo URL</Label><Input placeholder="https://…" /></div>
            </>)}
            <div className="sm:col-span-2 mt-2 flex justify-end"><Button type="submit">Save changes</Button></div>
          </form>
        </Card>
      </div>
    </div>
  );
}
