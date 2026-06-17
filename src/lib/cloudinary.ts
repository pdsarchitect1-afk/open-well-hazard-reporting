import imageCompression from "browser-image-compression";
import { cloudinary } from "./env";
import type { Photo } from "./types";

/**
 * Compress an image in the browser, then upload it directly to Cloudinary
 * using a SIGNED upload. We first ask our own server for a short-lived
 * signature (the API secret never reaches the browser), so anonymous clients
 * cannot upload without server authorization. Uploading from the browser also
 * keeps large photos off our Vercel serverless functions.
 */
export async function compressAndUpload(file: File): Promise<Photo> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY (and CLOUDINARY_API_SECRET on the server)."
    );
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  // 1) get a signature from our server
  const sigRes = await fetch("/api/cloudinary-sign");
  if (!sigRes.ok) {
    throw new Error("Could not get upload signature.");
  }
  const { cloudName, apiKey, timestamp, folder, signature } =
    await sigRes.json();

  // 2) upload directly to Cloudinary with the signature
  const form = new FormData();
  form.append("file", compressed);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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
  return Boolean(cloudinary.cloudName && cloudinary.apiKey);
}
