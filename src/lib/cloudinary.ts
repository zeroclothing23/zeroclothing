import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/** Upload a base64 / data URI or remote URL to Cloudinary, return secure URL. */
export async function uploadImage(
  source: string,
  folder = "zero-clothing",
): Promise<string> {
  const res = await cloudinary.uploader.upload(source, {
    folder,
    resource_type: "image",
  });
  return res.secure_url;
}
