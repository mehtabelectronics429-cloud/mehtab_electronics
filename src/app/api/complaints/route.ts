import { Complaint } from "@/lib/db/models/Complaint";
import { Customer } from "@/lib/db/models/Customer";
import {
  requireCap,
  json,
  errorResponse,
  parsePagination,
  paginate,
  serializeDoc,
} from "@/lib/api/http";
import { complaintInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { logActivity } from "@/lib/db/logActivity";

async function nextNumber() {
  const count = await Complaint.countDocuments({});
  return `CMP-${1000 + count + 1}`;
}

export async function GET(req: Request) {
  try {
    await requireCap("complaints.view");
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const status = url.searchParams.get("status");
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;
    if (p.q) {
      const rx = new RegExp(p.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { number: rx },
        { customerName: rx },
        { phone: rx },
        { address: rx },
        { complaint: rx },
      ];
    }
    return json(await paginate(Complaint, filter, p));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCap("complaints.manage");
    await connectMongo();
    const body = complaintInput.parse(await req.json());

    // Prefill contact details from the linked customer when available.
    let customerName = body.customerName;
    let phone = body.phone || "";
    let address = body.address || "";
    if (body.customerId) {
      const c = await Customer.findOne({ _id: body.customerId, ...notDeleted });
      if (c) {
        customerName = customerName || c.name;
        phone = phone || c.phone || c.whatsapp || "";
        address = address || c.address || "";
      }
    }

    const doc = await Complaint.create({
      number: await nextNumber(),
      customerId: body.customerId || null,
      customerName,
      phone,
      address,
      complaint: body.complaint,
      status: body.status || "open",
      serviceCharge: body.serviceCharge ?? 0,
      items: (body.items || []).map((i) => ({
        productId: i.productId || null,
        description: i.description,
        qty: i.qty,
        unitPrice: i.unitPrice,
      })),
      date: body.date ? new Date(body.date) : new Date(),
      notes: body.notes || "",
    });

    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "logged a complaint",
      target: `${doc.number} · ${customerName}`,
      kind: "customer",
    });

    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
