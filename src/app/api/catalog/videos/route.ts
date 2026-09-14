import { InstallationVideo } from "@/lib/db/models/InstallationVideo";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";
import { json, errorResponse } from "@/lib/api/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Public list of active installation videos for the marketing site. */
export async function GET() {
  try {
    await connectMongo();
    const items = await InstallationVideo.find({ ...notDeleted, active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return json({
      items: items.map((v) => ({
        id: String(v._id),
        title: v.title,
        videoUrl: v.videoUrl,
        thumbnail: v.thumbnail || "",
        category: v.category || "Solar",
        location: v.location || "",
        spec: v.spec || "",
        summary: v.summary || "",
      })),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
