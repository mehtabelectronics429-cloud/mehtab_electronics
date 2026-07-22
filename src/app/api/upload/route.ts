import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireUser, json, errorResponse, ApiError } from "@/lib/api/http";
import { can } from "@/lib/admin/permissions";
import { connectMongo } from "@/lib/db/mongodb";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!can(user.role, "products.manage") && !can(user.role, "purchases.manage")) {
      throw new ApiError(403, "Forbidden");
    }
    await connectMongo();

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return json({ error: "Expected multipart form data" }, 400);
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "mehtab_electronics/uploads");
    if (!file || typeof file === "string") {
      return json({ error: "No file uploaded" }, 400);
    }

    const blob = await file.arrayBuffer();
    const buffer = Buffer.from(blob);
    const filename = file.name || `upload-${Date.now()}`;
    const mime = file.type || "";
    const isPdf = mime === "application/pdf" || filename.toLowerCase().endsWith(".pdf");

    const result = await uploadToCloudinary(buffer, filename, {
      folder,
      resourceType: isPdf ? "raw" : "auto",
    });
    return json({ url: result.secure_url });
  } catch (err) {
    return errorResponse(err);
  }
}
