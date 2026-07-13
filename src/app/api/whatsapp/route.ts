import { WhatsAppMessage } from "@/lib/db/models/WhatsAppMessage";
import { Customer } from "@/lib/db/models/Customer";
import {
  requireCap,
  json,
  errorResponse,
  parsePagination,
  paginate,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { whatsappSendInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { TEMPLATE_EVENTS, type TemplateContext } from "@/lib/whatsapp/templates";
import {
  buildEventMessage,
  businessApiConfigured,
  getAdminWhatsAppNumber,
  getWhatsAppSendMode,
  resolveWhatsAppEvent,
} from "@/lib/whatsapp/sender";
import { dispatchWhatsAppEvent } from "@/lib/whatsapp/queue";

export async function GET(req: Request) {
  try {
    await requireCap("whatsapp.view");
    await connectMongo();
    const p = parsePagination(new URL(req.url));
    const [fromPhone, sendMode] = await Promise.all([getAdminWhatsAppNumber(), getWhatsAppSendMode()]);
    const result = await paginate(WhatsAppMessage, {}, { ...p, sort: p.sort || "-createdAt" });
    return json({
      ...result,
      fromPhone,
      sendMode,
      businessApiReady: businessApiConfigured(),
      items: result.items.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          ...row,
          at: row.createdAt || row.sentAt,
          to: row.toName,
          from: row.fromPhone || fromPhone,
        };
      }),
      templates: TEMPLATE_EVENTS.map((e) => ({
        event: e,
        label: buildEventMessage(e, { customerName: "Customer" }).template,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireCap("whatsapp.view");
    await connectMongo();
    const body = whatsappSendInput.parse(await req.json());

    let customerName = body.toName;
    if (body.customerId) {
      const c = await Customer.findOne({ _id: body.customerId, ...notDeleted });
      if (!c) throw new ApiError(400, "Invalid customer");
      customerName = c.name;
    }

    const event = resolveWhatsAppEvent(body.event || body.template);
    if (!event) throw new ApiError(400, "Unknown WhatsApp template / event");

    const ctx: TemplateContext = { customerName };
    const result = await dispatchWhatsAppEvent({
      event,
      channel: body.channel,
      customerId: body.customerId || null,
      toName: body.toName,
      toPhone: body.toPhone,
      ctx,
      bodyOverride: body.body || undefined,
    });

    return json(
      {
        message: serializeDoc(result.message),
        jobId: result.jobId,
        channel: result.channel,
        requestedChannel: result.requestedChannel,
        businessApiReady: result.businessApiReady,
        waUrl: result.waUrl,
      },
      201
    );
  } catch (err) {
    return errorResponse(err);
  }
}
