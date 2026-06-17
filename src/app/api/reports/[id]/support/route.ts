import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { Report } from "@/models/Report";

export const dynamic = "force-dynamic";

function buildQuery(id: string) {
  if (mongoose.isValidObjectId(id)) {
    return { $or: [{ reportId: id }, { _id: id }] };
  }
  return { reportId: id };
}

// POST /api/reports/:id/support — community "I saw this too" counter
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const doc = await Report.findOneAndUpdate(
    buildQuery(params.id),
    { $inc: { supports: 1 } },
    { new: true }
  )
    .select("supports reportId")
    .lean();

  if (!doc) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, supports: (doc as any).supports });
}
