import type { JobType } from "@/lib/db/models/Job";
import { WhatsAppMessage } from "@/lib/db/models/WhatsAppMessage";
import { connectMongo } from "@/lib/db/mongodb";
import { getAdminWhatsAppNumber } from "@/lib/whatsapp/sender";

async function sendWhatsApp(payload: Record<string, unknown>) {
  await connectMongo();
  const messageId = payload.messageId as string | undefined;
  const toPhone = String(payload.toPhone || "");
  const body = String(payload.body || "");
  const template = String(payload.template || "");
  const event = String(payload.event || "");
  const fromPhone = String(payload.fromPhone || (await getAdminWhatsAppNumber()));

  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  let status: "sent" | "failed" = "sent";
  let error = "";

  if (apiUrl && token && phoneId) {
    // Meta Cloud API: messages always leave from the business line bound to PHONE_NUMBER_ID.
    // That line must be the admin WhatsApp (Settings → businessNumber / WHATSAPP_BUSINESS_NUMBER).
    const res = await fetch(`${apiUrl}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toPhone.replace(/\D/g, ""),
        type: "text",
        text: {
          body:
            body ||
            `${template || event || "Notification"} from Mehtab Electronics (${fromPhone})`,
        },
      }),
    });
    if (!res.ok) {
      status = "failed";
      error = await res.text();
    }
  }
  // Without WhatsApp credentials: mock success (queued → sent). fromPhone is still stored.

  if (messageId) {
    await WhatsAppMessage.findByIdAndUpdate(messageId, {
      status,
      error,
      fromPhone,
      sentAt: status === "sent" ? new Date() : null,
    });
  }

  if (status === "failed") throw new Error(error || "WhatsApp send failed");
  return { status, mock: !(apiUrl && token && phoneId), fromPhone };
}

export async function processJob(type: JobType, payload: Record<string, unknown>) {
  switch (type) {
    case "whatsapp.send":
      return sendWhatsApp(payload);
    case "report.export":
      return { ok: true, exportedAt: new Date().toISOString(), ...payload };
    case "stock.recalc":
      return { ok: true };
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}
