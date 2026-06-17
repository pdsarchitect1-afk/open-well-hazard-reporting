import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { Report } from "@/models/Report";
import { createReportSchema } from "@/lib/validation";
import { calculateRisk } from "@/lib/risk";
import { generateReportId } from "@/lib/reportId";
import { suggestAuthorities } from "@/lib/authorities";
import { serialize } from "@/lib/serialize";
import { DUPLICATE_RADIUS_M } from "@/lib/constants";

export const dynamic = "force-dynamic";

// POST /api/reports — create a new report (with duplicate detection)
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  await dbConnect();

  // Duplicate detection: any existing report within DUPLICATE_RADIUS_M metres.
  // Best-effort: if the 2dsphere index isn't ready yet (cold start) the $near
  // query can throw — never let that block a genuine hazard report.
  if (!data.force) {
    try {
      const nearby = await Report.findOne({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [data.lng, data.lat] },
            $maxDistance: DUPLICATE_RADIUS_M,
          },
        },
      })
        .select("reportId riskLevel status supports address photos")
        .lean();

      if (nearby) {
        return NextResponse.json(
          { duplicate: true, existing: serialize(nearby) },
          { status: 409 }
        );
      }
    } catch (err) {
      console.error("duplicate check skipped:", err);
    }
  }

  const riskLevel = calculateRisk({
    condition: data.condition,
    depth: data.depth,
    waterPresent: data.waterPresent,
    riskFactors: data.riskFactors,
  });

  const district = data.address?.district;
  const reportId = await generateReportId(district);

  const doc = await Report.create({
    reportId,
    location: { type: "Point", coordinates: [data.lng, data.lat] },
    accuracyMeters: data.accuracyMeters,
    address: data.address ?? {},
    photos: data.photos,
    description: data.description,
    wellType: data.wellType,
    condition: data.condition,
    depth: data.depth,
    waterPresent: data.waterPresent,
    accessibility: data.accessibility,
    riskFactors: data.riskFactors ?? [],
    riskLevel,
    responsible: data.responsible ?? {},
    suggestedAuthorities: suggestAuthorities(district),
    reporter: data.reporter ?? {},
    status: "Reported",
    statusHistory: [{ status: "Reported", at: new Date(), by: "citizen" }],
    supports: 0,
  });

  return NextResponse.json(
    { ok: true, reportId: doc.reportId, id: String(doc._id) },
    { status: 201 }
  );
}

// GET /api/reports — list reports (for the public map + admin), with filters
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);

  const query: Record<string, unknown> = {};
  const district = searchParams.get("district");
  const risk = searchParams.get("risk");
  const status = searchParams.get("status");
  if (district) query["address.district"] = district;
  if (risk) query.riskLevel = risk;
  if (status) query.status = status;

  const limit = Math.min(Number(searchParams.get("limit") ?? 2000), 5000);

  const docs = await Report.find(query)
    .select(
      "reportId location riskLevel status address supports photos createdAt"
    )
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ reports: serialize(docs) });
}
