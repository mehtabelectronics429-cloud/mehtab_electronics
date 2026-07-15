import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireCap, json, errorResponse } from "@/lib/api/http";
import { connectMongo } from "@/lib/db/mongodb";

export async function POST(req: Request) {
  try {
    await requireCap("products.manage");
    await connectMongo();

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return json({ error: "Expected multipart form data" }, 400);
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return json({ error: "No file uploaded" }, 400);
    }

    const blob = await file.arrayBuffer();
    const buffer = Buffer.from(blob);
    const filename = file.name || `product-${Date.now()}`;

    const result = await uploadToCloudinary(buffer, filename);
    return json({ url: result.secure_url });
  } catch (err) {
    return errorResponse(err);
  }
}
