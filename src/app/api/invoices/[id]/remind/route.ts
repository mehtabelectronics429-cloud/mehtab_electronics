import { Invoice } from "@/lib/db/models/Invoice";
import { requireUser, json, errorResponse, ApiError } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { dispatchWhatsAppEvent } from "@/lib/whatsapp/queue";

type Ctx = { params: { id: string } };

const fmt = (n: number) => Number(n || 0).toLocaleString("en-PK");

/** Send a WhatsApp payment reminder for one specific unpaid invoice. */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    if (!can(user.role, "whatsapp.send")) throw new ApiError(403, "Forbidden");
    await connectMongo();

    const body = (await req.json().catch(() => ({}))) as {
      channel?: "direct" | "business";
    };

    const invoice = await Invoice.findOne({
      _id: params.id,
      ...notDeleted,
    }).populate("customerId", "name phone whatsapp");
    if (!invoice) throw new ApiError(404, "Invoice not found");

    const customer = invoice.customerId as unknown as {
      _id?: unknown;
      name?: string;
      phone?: string;
      whatsapp?: string;
    } | null;
    const toPhone = (customer?.whatsapp || customer?.phone || "").trim();
    if (!toPhone) throw new ApiError(400, "No customer phone number on file");

    const netTotal = (invoice.amount || 0) - (invoice.returnedAmount || 0);
    const balance = Math.max(0, netTotal - (invoice.paid || 0));
    if (balance <= 0) throw new ApiError(400, "This invoice has no balance due");

    const name = customer?.name || "Customer";
    const bodyOverride =
      `Assalam o Alaikum ${name},\n\n` +
      `A friendly payment reminder from Mehtab Electronics for invoice ${invoice.number}.\n` +
      `Total: PKR ${fmt(netTotal)}\n` +
      `Paid: PKR ${fmt(invoice.paid || 0)}\n` +
      `Balance due: PKR ${fmt(balance)}\n\n` +
      `Please arrange payment at your earliest convenience. JazakAllah.\n\n Team Mehtab Electronics`;

    const result = await dispatchWhatsAppEvent({
      event: "payment_reminder",
      channel: body.channel,
      customerId: customer?._id ? String(customer._id) : null,
      toName: name,
      toPhone,
      ctx: { customerName: name, balance },
      bodyOverride,
    });

    return json(
      {
        ok: true,
        channel: result.channel,
        requestedChannel: result.requestedChannel,
        businessApiReady: result.businessApiReady,
        jobId: result.jobId,
        waUrl: result.waUrl,
        template: result.message.template,
      },
      201,
    );
  } catch (err) {
    return errorResponse(err);
  }
}
