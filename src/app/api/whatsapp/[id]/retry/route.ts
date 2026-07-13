import { WhatsAppMessage } from "@/lib/db/models/WhatsAppMessage";
import { requireCap, json, errorResponse, ApiError } from "@/lib/api/http";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { enqueueJob } from "@/lib/queue/enqueue";
import { serializeDoc } from "@/lib/api/http";

type Ctx = { params: { id: string } };

/** Retry a failed WhatsApp message via the job queue. */
export async function POST(_req: Request, { params }: Ctx) {
  try {
    await requireCap("whatsapp.view");
    await connectMongo();
    const msg = await WhatsAppMessage.findOne({ _id: params.id, ...notDeleted });
    if (!msg) throw new ApiError(404, "Message not found");
    msg.status = "queued";
    msg.error = "";
    const job = await enqueueJob("whatsapp.send", {
      messageId: String(msg._id),
      fromPhone: msg.fromPhone,
      toPhone: msg.toPhone,
      template: msg.template,
      body: msg.body,
      event: msg.event,
    });
    msg.jobId = job._id;
    await msg.save();
    return json({ message: serializeDoc(msg), jobId: String(job._id) });
  } catch (err) {
    return errorResponse(err);
  }
}
