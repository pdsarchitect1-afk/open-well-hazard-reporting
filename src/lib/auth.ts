import { SignJWT, jwtVerify } from "jose";
import { getSessionSecret } from "./env";

export const ADMIN_COOKIE = "ow_admin";

/** Create a signed session token (valid 7 days). */
export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());
}

/** Verify a session token. Returns true when valid. */
export async function verifyAdminToken(token?: string): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
