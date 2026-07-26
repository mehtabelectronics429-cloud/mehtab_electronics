import { Material } from "@/lib/db/models/Material";
import { requireCap, errorResponse } from "@/lib/api/http";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { csvResponse } from "@/lib/api/csv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireCap("materials.view");
    await connectMongo();
    const q = (new URL(req.url).searchParams.get("q") || "").trim();
    const filter: Record<string, unknown> = { ...notDeleted };
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.name = rx;
    }
    const items = await Material.find(filter).sort({ name: 1 }).lean();
    return csvResponse(
      "materials-export.csv",
      [
        "Name",
        "Unit",
        "Opening",
        "Issued",
        "Used",
        "Returned",
        "Damaged",
        "Available",
        "Reorder",
      ],
      items.map((m) => {
        const available =
          (m.opening ?? 0) - (m.used ?? 0) - (m.damaged ?? 0);
        return [
          m.name,
          m.unit,
          m.opening ?? 0,
          m.issued ?? 0,
          m.used ?? 0,
          m.returned ?? 0,
          m.damaged ?? 0,
          available,
          m.reorder ?? 0,
        ];
      }),
    );
  } catch (err) {
    return errorResponse(err);
  }
}
