import { Quotation } from "@/lib/db/models/Quotation";
import {
  requireCap,
  json,
  errorResponse,
  parsePagination,
  paginate,
  serializeDoc,
} from "@/lib/api/http";
import { quotationInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { logActivity } from "@/lib/db/logActivity";
import { quotationTotal, toQuotationUpdate } from "./normalize";

export async function GET(req: Request) {
  try {
    await requireCap("installations.manage");
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const filter: Record<string, unknown> = {};
    const status = url.searchParams.get("status");
    if (status && status !== "all") filter.status = status;
    if (p.q) {
      const rx = new RegExp(p.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { number: rx },
        { customerName: rx },
        { customerPhone: rx },
        { title: rx },
      ];
    }
    // The list view only needs summary fields, not every line item.
    const page = await paginate(Quotation, filter, { ...p, sort: "-updatedAt" });
    return json({
      ...page,
      items: page.items.map(({ items, ...rest }) => ({
        ...rest,
        itemCount: Array.isArray(items) ? items.length : 0,
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCap("installations.manage");
    await connectMongo();
    const body = quotationInput.parse(await req.json());
    const doc = await Quotation.create({
      ...toQuotationUpdate(body),
      total: quotationTotal(body),
      createdBy: user.name,
    });
    await logActivity({
      actor: user.name,
      actorId: user.id,
      action: "saved a quotation",
      target: `${body.number}${body.customerName ? ` · ${body.customerName}` : ""}`,
      kind: "invoice",
    });
    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
