import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export function uploadToCloudinary(file: Buffer, filename: string) {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const publicId = filename.replace(/\.[^.]+$/, "");
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "mehtab_electronics/products",
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result || !result.secure_url) return reject(new Error("Cloudinary upload failed"));
        resolve({ secure_url: result.secure_url });
      }
    );
    stream.end(file);
  });
}
