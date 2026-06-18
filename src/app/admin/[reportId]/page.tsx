import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/mongoose";
import { Report } from "@/models/Report";
import { serialize } from "@/lib/serialize";
import AdminReportManager from "@/components/AdminReportManager";
import type { ReportDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminReportPage({
  params,
}: {
  params: { reportId: string };
}) {
  await dbConnect();
  const doc = await Report.findOne({ reportId: params.reportId }).lean();
  if (!doc) notFound();
  const report = serialize<ReportDTO>(doc);

  const [lng, lat] = report.location.coordinates;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-brand underline">
          ← Back to dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold text-slate-800">{report.reportId}</h1>
        <p className="text-sm text-slate-500">
          {[report.address?.village, report.address?.taluka, report.address?.district]
            .filter(Boolean)
            .join(", ") || "—"}{" "}
          · Risk: <strong>{report.riskLevel}</strong> · {report.supports} supports
        </p>
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-brand underline"
        >
          Open in Google Maps →
        </a>
      </div>

      {/* Photos */}
      {report.photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {report.photos.map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt=""
                className="h-28 w-full rounded-lg object-cover"
              />
            </a>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="card space-y-1 text-sm text-slate-600">
        {report.description && <p>📝 {report.description}</p>}
        {report.wellType && <p>Type: {report.wellType}</p>}
        {report.condition && <p>Condition: {report.condition}</p>}
        {report.depth && <p>Depth: {report.depth}</p>}
        {report.waterPresent && <p>Water present: {report.waterPresent}</p>}
        {report.accessibility && <p>Access: {report.accessibility}</p>}
        {report.riskFactors?.length > 0 && (
          <p>Risk factors: {report.riskFactors.join(", ")}</p>
        )}
        {report.responsible?.ownerName && (
          <p>Owner: {report.responsible.ownerName}</p>
        )}
        {report.responsible?.jurisdiction && (
          <p>Jurisdiction: {report.responsible.jurisdiction}</p>
        )}
        {report.responsible?.responsiblePerson && (
          <p>Responsible person: {report.responsible.responsiblePerson}</p>
        )}
        {report.reporter?.name && <p>Reporter: {report.reporter.name}</p>}
        {report.reporter?.phone && <p>Phone: {report.reporter.phone}</p>}
      </div>

      {/* Responsible / suggested authorities */}
      {report.suggestedAuthorities?.length > 0 && (
        <div className="card">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Suggested / assigned authorities
          </p>
          <ul className="space-y-1 text-sm text-slate-600">
            {report.suggestedAuthorities.map((a, i) => (
              <li key={i}>
                • {a.name} — {a.role}
                {a.contact ? ` (${a.contact})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <AdminReportManager report={report} />

      {/* Timeline */}
      <div className="card">
        <p className="mb-3 text-sm font-semibold text-slate-700">History</p>
        <ol className="space-y-2 text-sm">
          {report.statusHistory.map((e, i) => (
            <li key={i} className="text-slate-600">
              <strong>{e.status}</strong>{" "}
              <span className="text-slate-400">
                · {new Date(e.at).toLocaleString("en-IN")}
                {e.by ? ` · ${e.by}` : ""}
              </span>
              {e.note && <p className="text-xs text-slate-500">{e.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
