import { NextRequest, NextResponse } from "next/server";
import { getAdminPassword } from "@/lib/env";
import { createAdminToken, ADMIN_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/admin/login — exchange the shared password for a signed cookie.
export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Read server config separately so a misconfiguration isn't reported as a
  // wrong password (these throw if the env vars are missing on the server).
  let expectedPassword: string;
  try {
    expectedPassword = getAdminPassword();
  } catch {
    return NextResponse.json(
      { error: "config", message: "Server missing ADMIN_PASSWORD env var." },
      { status: 500 }
    );
  }

  if (!body.password || body.password !== expectedPassword) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createAdminToken();
  } catch {
    return NextResponse.json(
      {
        error: "config",
        message:
          "Server missing/invalid ADMIN_SESSION_SECRET (needs >= 16 chars).",
      },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
