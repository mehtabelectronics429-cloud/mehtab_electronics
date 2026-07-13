/**
 * WhatsApp message templates for operational events.
 * Bodies are plain text (Meta Cloud template API can replace this later).
 */
export type WhatsAppEvent =
  | "payment_reminder"
  | "ledger_statement"
  | "invoice"
  | "receipt"
  | "installation_completed"
  | "installation_approved"
  | "quotation"
  | "warranty_reminder";

export const WHATSAPP_TEMPLATES: Record<
  WhatsAppEvent,
  { label: string; build: (ctx: TemplateContext) => string }
> = {
  payment_reminder: {
    label: "Payment Reminder",
    build: (c) =>
      `Assalam o Alaikum ${c.customerName},\n\nThis is a friendly reminder from Mehtab Electronics.\nOutstanding balance: PKR ${fmt(c.balance)}.\nPlease arrange payment at your earliest convenience.\n\n— Team Mehtab Electronics`,
  },
  ledger_statement: {
    label: "Ledger Statement",
    build: (c) =>
      `Assalam o Alaikum ${c.customerName},\n\nYour account ledger summary:\nBalance: PKR ${fmt(c.balance)}\nEntries: ${c.entryCount ?? 0}\n${c.extra || ""}\nReply if you need a detailed statement.\n\n— Team Mehtab Electronics`,
  },
  invoice: {
    label: "Invoice",
    build: (c) =>
      `Assalam o Alaikum ${c.customerName},\n\nInvoice ${c.ref || ""} for PKR ${fmt(c.amount)} has been issued.\nPaid: PKR ${fmt(c.paid)}\nBalance: PKR ${fmt((c.amount || 0) - (c.paid || 0))}\n\n— Team Mehtab Electronics`,
  },
  receipt: {
    label: "Receipt",
    build: (c) =>
      `Assalam o Alaikum ${c.customerName},\n\nWe received your payment of PKR ${fmt(c.amount)}. Thank you!\nUpdated balance: PKR ${fmt(c.balance)}\n\n— Team Mehtab Electronics`,
  },
  installation_completed: {
    label: "Installation Completed",
    build: (c) =>
      `Assalam o Alaikum ${c.customerName},\n\nYour installation ${c.ref || ""} (${c.jobType || "job"}) is marked completed.\nThank you for choosing Mehtab Electronics.\n\n— Team Mehtab Electronics`,
  },
  installation_approved: {
    label: "Installation Approved",
    build: (c) =>
      `Assalam o Alaikum ${c.customerName},\n\nInstallation ${c.ref || ""} has been approved.\nAmount: PKR ${fmt(c.amount)}\n\n— Team Mehtab Electronics`,
  },
  quotation: {
    label: "Quotation",
    build: (c) =>
      `Assalam o Alaikum ${c.customerName},\n\nQuotation for ${c.jobType || "your project"}: PKR ${fmt(c.amount)}.\nValid for 7 days. Contact us to proceed.\n\n— Team Mehtab Electronics`,
  },
  warranty_reminder: {
    label: "Warranty Reminder",
    build: (c) =>
      `Assalam o Alaikum ${c.customerName},\n\nReminder: warranty check for ${c.ref || "your installation"} is due.\nContact Mehtab Electronics to schedule a visit.\n\n— Team Mehtab Electronics`,
  },
};

export interface TemplateContext {
  customerName: string;
  balance?: number;
  amount?: number;
  paid?: number;
  ref?: string;
  jobType?: string;
  entryCount?: number;
  extra?: string;
}

function fmt(n?: number) {
  return Number(n || 0).toLocaleString("en-PK");
}

export function buildWhatsAppBody(event: WhatsAppEvent, ctx: TemplateContext) {
  return WHATSAPP_TEMPLATES[event].build(ctx);
}

export function templateLabel(event: WhatsAppEvent) {
  return WHATSAPP_TEMPLATES[event].label;
}

export const TEMPLATE_EVENTS = Object.keys(WHATSAPP_TEMPLATES) as WhatsAppEvent[];
