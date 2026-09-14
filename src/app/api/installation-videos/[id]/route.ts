import { InstallationVideo } from "@/lib/db/models/InstallationVideo";
import {
  requireCap,
  json,
  errorResponse,
  serializeDoc,
  softDeleteById,
  ApiError,
} from "@/lib/api/http";
import { installationVideoInput } from "@/lib/api/schemas";
import { connectMongo } from "@/lib/db/mongodb";
import { notDeleted } from "@/lib/db/soft-delete";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireCap("content.manage");
    await connectMongo();
    const body = installationVideoInput.partial().parse(await req.json());
    const doc = await InstallationVideo.findOneAndUpdate(
      { _id: params.id, ...notDeleted },
      body,
      { returnDocument: "after" },
    );
    if (!doc) throw new ApiError(404, "Video not found");
    return json(serializeDoc(doc));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireCap("content.manage");
    await connectMongo();
    await softDeleteById(InstallationVideo, params.id);
    return json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
