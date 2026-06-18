// Minimal offline submit queue using localStorage.
// If a report POST fails (no network), we stash the payload and retry on load
// and on the browser's "online" event.

import type { Address, Photo } from "./types";

export interface PendingReport {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  photos: Photo[];
  address?: Address;
  description?: string;
  wellType?: string;
  condition?: string;
  depth?: string;
  waterPresent?: string;
  accessibility?: string;
  riskFactors?: string[];
  riskLevel?: string;
  responsible?: Record<string, unknown>;
  reporter?: Record<string, unknown>;
  force?: boolean;
}

const KEY = "ow_pending_reports";

function read(): PendingReport[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(list: PendingReport[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function savePending(report: PendingReport) {
  const list = read();
  list.push(report);
  write(list);
}

export async function flushPending(): Promise<number> {
  const list = read();
  if (list.length === 0) return 0;

  const remaining: PendingReport[] = [];
  let sent = 0;
  for (const report of list) {
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...report, force: true }),
      });
      if (res.ok || res.status === 409) sent++;
      else remaining.push(report);
    } catch {
      remaining.push(report);
    }
  }
  write(remaining);
  return sent;
}
