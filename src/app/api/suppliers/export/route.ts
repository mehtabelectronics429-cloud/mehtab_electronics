import { Supplier } from "@/lib/db/models/Supplier";
import { requireCap, errorResponse } from "@/lib/api/http";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { csvResponse } from "@/lib/api/csv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireCap("suppliers.view");
    await connectMongo();
    const q = (new URL(req.url).searchParams.get("q") || "").trim();
    const filter: Record<string, unknown> = { ...notDeleted };
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { company: rx }, { phone: rx }, { email: rx }];
    }
    const items = await Supplier.find(filter).sort({ name: 1 }).lean();
    return csvResponse(
      "suppliers-export.csv",
      ["Name", "Company", "Phone", "Email", "Address", "Payable", "Notes"],
      items.map((s) => [
        s.name,
        s.company || "",
        s.phone || "",
        s.email || "",
        s.address || "",
        s.balance ?? 0,
        s.notes || "",
      ]),
    );
  } catch (err) {
    return errorResponse(err);
  }
}
