import { connectMongo } from "@/lib/db/mongodb";
import { WhatsAppMessage } from "@/lib/db/models/WhatsAppMessage";
import { enqueueJob } from "@/lib/queue/enqueue";
import type { WhatsAppEvent, TemplateContext } from "@/lib/whatsapp/templates";
import {
  buildDirectWaUrl,
  buildEventMessage,
  businessApiConfigured,
  getAdminWhatsAppNumber,
  getWhatsAppSendMode,
  normalizeChannel,
  type WhatsAppChannel,
} from "@/lib/whatsapp/sender";

export type DispatchResult = {
  message: InstanceType<typeof WhatsAppMessage>;
  channel: WhatsAppChannel;
  /** Channel the caller asked for (may differ if Business API not configured) */
  requestedChannel: WhatsAppChannel;
  jobId: string | null;
  waUrl: string | null;
  businessApiReady: boolean;
};

/**
 * Send via:
 * - direct → wa.me link with templated text (admin opens WhatsApp and taps Send)
 * - business → Meta Cloud API job queue (needs WHATSAPP_API_* env)
 */
export async function dispatchWhatsAppEvent(opts: {
  event: WhatsAppEvent;
  customerId?: string | null;
  toName: string;
  toPhone: string;
  ctx: TemplateContext;
  bodyOverride?: string;
  /** Override Settings default send mode */
  channel?: WhatsAppChannel | string | null;
}): Promise<DispatchResult> {
  await connectMongo();

  const requestedChannel = normalizeChannel(opts.channel ?? (await getWhatsAppSendMode()));
  const apiReady = businessApiConfigured();
  let channel = requestedChannel;
  if (channel === "business" && !apiReady) {
    channel = "direct";
  }

  const fromPhone = await getAdminWhatsAppNumber();
  const built = buildEventMessage(opts.event, opts.ctx, opts.bodyOverride);
  const waUrl = channel === "direct" ? buildDirectWaUrl(opts.toPhone, built.body) : null;

  const msg = await WhatsAppMessage.create({
    customerId: opts.customerId || null,
    fromPhone,
    toName: opts.toName,
    toPhone: opts.toPhone,
    channel,
    event: built.event,
    template: built.template,
    body: built.body,
    waUrl: waUrl || "",
    status: channel === "direct" ? "sent" : "queued",
    sentAt: channel === "direct" ? new Date() : null,
  });

  if (channel === "business") {
    const job = await enqueueJob("whatsapp.send", {
      messageId: String(msg._id),
      fromPhone,
      toPhone: msg.toPhone,
      template: msg.template,
      body: msg.body,
      event: opts.event,
      channel: "business",
    });
    msg.jobId = job._id;
    await msg.save();
    return {
      message: msg,
      channel,
      requestedChannel,
      jobId: String(job._id),
      waUrl: null,
      businessApiReady: apiReady,
    };
  }

  return {
    message: msg,
    channel,
    requestedChannel,
    jobId: null,
    waUrl,
    businessApiReady: apiReady,
  };
}

/** @deprecated use dispatchWhatsAppEvent */
export async function queueWhatsAppEvent(
  opts: Parameters<typeof dispatchWhatsAppEvent>[0]
) {
  return dispatchWhatsAppEvent(opts);
}
