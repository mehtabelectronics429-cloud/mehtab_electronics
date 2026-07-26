import { Purchase } from "@/lib/db/models/Purchase";
import { requireCap, errorResponse } from "@/lib/api/http";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { csvResponse } from "@/lib/api/csv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    await requireCap("purchases.view");
    await connectMongo();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const q = (url.searchParams.get("q") || "").trim();
    const filter: Record<string, unknown> = { ...notDeleted };
    if (status && status !== "all") filter.status = status;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ ref: rx }, { supplierInvoiceNo: rx }];
    }
    const items = await Purchase.find(filter)
      .populate("supplierId", "name")
      .sort({ date: -1 })
      .lean();
    return csvResponse(
      "purchases-export.csv",
      [
        "Ref",
        "Supplier",
        "Supplier Invoice",
        "Date",
        "Amount",
        "Paid",
        "Balance",
        "Status",
      ],
      items.map((p) => {
        const supplier =
          typeof p.supplierId === "object" &&
          p.supplierId &&
          "name" in p.supplierId
            ? String((p.supplierId as { name?: string }).name || "")
            : "";
        const amount = p.amount ?? 0;
        const paid = p.paid ?? 0;
        return [
          p.ref,
          supplier,
          p.supplierInvoiceNo || "",
          p.date instanceof Date
            ? p.date.toISOString().slice(0, 10)
            : String(p.date || ""),
          amount,
          paid,
          Math.max(0, amount - paid),
          p.status,
        ];
      }),
    );
  } catch (err) {
    return errorResponse(err);
  }
}
