import { Settings } from "@/lib/db/models/Settings";
import {
  requireCap,
  json,
  errorResponse,
  serializeDoc,
  ApiError,
} from "@/lib/api/http";
import { settingsInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await requireCap("settings.manage");
    await connectMongo();
    const docs = await Settings.find({ ...notDeleted }).lean();
    const map: Record<string, unknown> = {};
    for (const d of docs) map[d.key] = d.value;
    return json({ settings: map });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(req: Request) {
  try {
    await requireCap("settings.manage");
    await connectMongo();
    const body = settingsInput.parse(await req.json());
    const doc = await Settings.findOneAndUpdate(
      { key: body.key, ...notDeleted },
      { key: body.key, value: body.value, deletedAt: null },
      { upsert: true, returnDocument: "after" },
    );
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}
