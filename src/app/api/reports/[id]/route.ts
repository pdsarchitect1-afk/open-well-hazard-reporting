import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { Report } from "@/models/Report";
import { patchReportSchema } from "@/lib/validation";
import { serialize } from "@/lib/serialize";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import { RESOLVED_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

// Accept either the human reportId (MH-...) or the Mongo _id.
function buildQuery(id: string) {
  if (mongoose.isValidObjectId(id)) {
    return { $or: [{ reportId: id }, { _id: id }] };
  }
  return { reportId: id };
}

// GET /api/reports/:id — public detail
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const doc = await Report.findOne(buildQuery(params.id)).lean();
  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ report: serialize(doc) });
}

// PATCH /api/reports/:id — admin only (status / authority / note)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { status, note, by, assignedAuthority } = parsed.data;

  await dbConnect();
  const doc = await Report.findOne(buildQuery(params.id));
  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (status && status !== doc.status) {
    doc.status = status;
    doc.statusHistory.push({
      status,
      note,
      at: new Date(),
      by: by || "admin",
    });
    // Mark resolved time implicitly via statusHistory (used in metrics).
  } else if (note) {
    // Note without status change: record against current status.
    doc.statusHistory.push({
      status: doc.status,
      note,
      at: new Date(),
      by: by || "admin",
    });
  }

  if (assignedAuthority) {
    const exists = doc.suggestedAuthorities.some(
      (a: any) => a.name === assignedAuthority.name
    );
    if (!exists) doc.suggestedAuthorities.push(assignedAuthority);
  }

  await doc.save();
  void RESOLVED_STATUSES; // referenced for clarity in metrics elsewhere
  return NextResponse.json({ ok: true, report: serialize(doc.toObject()) });
}
