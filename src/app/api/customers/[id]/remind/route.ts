import { Customer } from "@/lib/db/models/Customer";
import { requireUser, json, errorResponse, ApiError } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { ownCustomerIdList, isOwnScope } from "@/lib/api/scope";
import { dispatchWhatsAppEvent } from "@/lib/whatsapp/queue";
import type { WhatsAppEvent } from "@/lib/whatsapp/templates";
import { serializeDoc } from "@/lib/api/http";

type Ctx = { params: { id: string } };

/** Queue / open a WhatsApp event for a customer (payment reminder, ledger statement, etc.). */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    if (!can(user.role, "whatsapp.send") && !can(user.role, "whatsapp.view")) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();
    const ownIds = await ownCustomerIdList(user);
    if (isOwnScope(ownIds) && !ownIds.includes(params.id)) throw new ApiError(403, "Forbidden");

    const body = (await req.json().catch(() => ({}))) as {
      event?: WhatsAppEvent;
      channel?: "direct" | "business";
    };
    const event: WhatsAppEvent = body.event || "payment_reminder";

    const customer = await Customer.findOne({ _id: params.id, ...notDeleted });
    if (!customer) throw new ApiError(404, "Customer not found");

    const result = await dispatchWhatsAppEvent({
      event,
      channel: body.channel,
      customerId: String(customer._id),
      toName: customer.name,
      toPhone: customer.whatsapp || customer.phone,
      ctx: {
        customerName: customer.name,
        balance: customer.balance,
      },
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
        message: serializeDoc(result.message),
      },
      201
    );
  } catch (err) {
    return errorResponse(err);
  }
}
