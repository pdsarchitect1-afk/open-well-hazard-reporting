import { Counter } from "@/models/Counter";
import { DISTRICT_CODES } from "./constants";

export function districtCode(district?: string): string {
  if (!district) return "GEN";
  return DISTRICT_CODES[district.trim()] ?? "GEN";
}

/**
 * Atomically allocate the next sequence number for a (districtCode, year)
 * bucket and format it as a human-readable ID, e.g. MH-PUN-2026-000123.
 */
export async function generateReportId(district?: string): Promise<string> {
  const code = districtCode(district);
  const year = new Date().getFullYear();
  const key = `${code}-${year}`;

  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();

  const seq = (counter?.seq ?? 1).toString().padStart(6, "0");
  return `MH-${code}-${year}-${seq}`;
}
