import { NextResponse } from "next/server";
import crypto from "crypto";
import { cloudinary, getCloudinarySecret } from "@/lib/env";

export const dynamic = "force-dynamic";

const UPLOAD_FOLDER = "open-well";

// GET /api/cloudinary-sign — returns a short-lived signature so the browser
// can upload directly to Cloudinary. The API secret never leaves the server,
// and uploads can't happen without this server-issued signature (anti-abuse).
export async function GET() {
  if (!cloudinary.cloudName || !cloudinary.apiKey) {
    return NextResponse.json(
      { error: "Cloudinary cloud name / API key not configured." },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Sign exactly the params we will send (excluding file, api_key, cloud_name).
  const toSign = `folder=${UPLOAD_FOLDER}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(toSign + getCloudinarySecret())
    .digest("hex");

  return NextResponse.json({
    cloudName: cloudinary.cloudName,
    apiKey: cloudinary.apiKey,
    timestamp,
    folder: UPLOAD_FOLDER,
    signature,
  });
}
