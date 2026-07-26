import { Customer } from "@/lib/db/models/Customer";
import { requireCap, errorResponse } from "@/lib/api/http";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { csvResponse } from "@/lib/api/csv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireCap("customers.view");
    await connectMongo();
    const q = (new URL(req.url).searchParams.get("q") || "").trim();
    const filter: Record<string, unknown> = { ...notDeleted };
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { phone: rx }, { whatsapp: rx }, { address: rx }];
    }
    const items = await Customer.find(filter).sort({ name: 1 }).lean();
    return csvResponse(
      "customers-export.csv",
      ["Name", "Phone", "WhatsApp", "Address", "Balance", "Notes"],
      items.map((c) => [
        c.name,
        c.phone,
        c.whatsapp,
        c.address,
        c.balance ?? 0,
        c.notes || "",
      ]),
    );
  } catch (err) {
    return errorResponse(err);
  }
}
