import { Settings } from "@/lib/db/models/Settings";
import { notDeleted } from "@/lib/db/soft-delete";
import { COMPANY } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import {
  WHATSAPP_TEMPLATES,
  buildWhatsAppBody,
  templateLabel,
  type WhatsAppEvent,
  type TemplateContext,
} from "@/lib/whatsapp/templates";

export type WhatsAppChannel = "direct" | "business";

/** Map UI / stored labels back to event keys. */
const LABEL_TO_EVENT = Object.fromEntries(
  (Object.keys(WHATSAPP_TEMPLATES) as WhatsAppEvent[]).map((k) => [
    WHATSAPP_TEMPLATES[k].label,
    k,
  ]),
) as Record<string, WhatsAppEvent>;

export function resolveWhatsAppEvent(input: string): WhatsAppEvent | null {
  if (input in WHATSAPP_TEMPLATES) return input as WhatsAppEvent;
  return LABEL_TO_EVENT[input] || null;
}

export function normalizeChannel(raw?: string | null): WhatsAppChannel {
  return raw === "business" ? "business" : "direct";
}

async function whatsappSettings() {
  const doc = await Settings.findOne({ key: "whatsapp", ...notDeleted }).lean();
  return (doc?.value || {}) as {
    businessNumber?: string;
    sendMode?: string;
    provider?: string;
    signature?: string;
  };
}

/**
 * Default channel from Settings (direct | business). Defaults to direct
 * no Business API required.
 */
export async function getWhatsAppSendMode(): Promise<WhatsAppChannel> {
  const s = await whatsappSettings();
  return normalizeChannel(s.sendMode || process.env.WHATSAPP_SEND_MODE);
}

/**
 * Business / admin WhatsApp number (shown as “from”).
 * Priority: Settings → WHATSAPP_BUSINESS_NUMBER → COMPANY.whatsapp.
 */
export async function getAdminWhatsAppNumber(): Promise<string> {
  const s = await whatsappSettings();
  const fromSettings = String(s.businessNumber || "").trim();
  if (fromSettings) return fromSettings;
  const fromEnv = (process.env.WHATSAPP_BUSINESS_NUMBER || "").trim();
  if (fromEnv) return fromEnv;
  return COMPANY.whatsapp;
}

export function buildEventMessage(
  event: WhatsAppEvent,
  ctx: TemplateContext,
  bodyOverride?: string,
) {
  return {
    event,
    template: templateLabel(event),
    body: bodyOverride || buildWhatsAppBody(event, ctx),
  };
}

/** Direct chat link: opens WhatsApp to the customer with the template pre-filled. */
export function buildDirectWaUrl(toPhone: string, body: string) {
  return waLink(body, toPhone);
}

export function businessApiConfigured() {
  return Boolean(
    process.env.WHATSAPP_API_URL &&
    process.env.WHATSAPP_API_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
}
