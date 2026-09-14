import { InstallationVideo } from "@/lib/db/models/InstallationVideo";
import {
  requireCap,
  json,
  errorResponse,
  parsePagination,
  paginate,
  serializeDoc,
} from "@/lib/api/http";
import { installationVideoInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";

export async function GET(req: Request) {
  try {
    await requireCap("content.manage");
    await connectMongo();
    const url = new URL(req.url);
    const p = parsePagination(url);
    const filter: Record<string, unknown> = {};
    if (p.q) {
      const rx = new RegExp(p.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: rx }, { category: rx }, { location: rx }];
    }
    return json(
      await paginate(InstallationVideo, filter, { ...p, sort: "order -createdAt" }),
    );
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireCap("content.manage");
    await connectMongo();
    const body = installationVideoInput.parse(await req.json());
    const doc = await InstallationVideo.create(body);
    return json(serializeDoc(doc), 201);
  } catch (err) {
    return errorResponse(err);
  }
}
