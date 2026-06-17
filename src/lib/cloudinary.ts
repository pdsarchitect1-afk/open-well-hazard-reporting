import imageCompression from "browser-image-compression";
import { cloudinary } from "./env";
import type { Photo } from "./types";

/**
 * Compress an image in the browser, then upload it directly to Cloudinary
 * using an UNSIGNED upload preset. Uploading from the browser keeps large
 * photos off our Vercel serverless functions (which cap request bodies).
 */
export async function compressAndUpload(file: File): Promise<Photo> {
  if (!cloudinary.cloudName || !cloudinary.uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  const form = new FormData();
  form.append("file", compressed);
  form.append("upload_preset", cloudinary.uploadPreset);
  form.append("folder", "open-well");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const json = await res.json();
  return {
    url: json.secure_url as string,
    publicId: json.public_id as string,
    width: json.width as number,
    height: json.height as number,
  };
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudinary.cloudName && cloudinary.uploadPreset);
}
