import { dbConnect } from "@/lib/mongoose";
import { Report } from "@/models/Report";
import { serialize } from "@/lib/serialize";
import LogoutButton from "@/components/LogoutButton";
import AdminReportRow from "@/components/AdminReportRow";
import type { ReportDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

function avgResolutionDays(reports: ReportDTO[]): string {
  const resolved = reports.filter((r) => r.status === "Resolved");
  if (resolved.length === 0) return "—";
  let total = 0;
  let n = 0;
  for (const r of resolved) {
    const ev = r.statusHistory?.find((e) => e.status === "Resolved");
    const end = ev ? new Date(ev.at) : new Date(r.updatedAt);
    const start = new Date(r.createdAt);
    const days = (end.getTime() - start.getTime()) / 86400000;
    if (days >= 0) {
      total += days;
      n++;
    }
  }
  return n ? `${(total / n).toFixed(1)} days` : "—";
}

export default async function AdminDashboard() {
  await dbConnect();
  const docs = await Report.find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  const reports = serialize<ReportDTO[]>(docs);

  // Show most dangerous first (Critical → High → Medium → Low),
  // newest first within the same risk level.
  const RISK_ORDER: Record<string, number> = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
  };
  reports.sort(
    (a, b) =>
      (RISK_ORDER[a.riskLevel] ?? 9) - (RISK_ORDER[b.riskLevel] ?? 9) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const total = reports.length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;
  const open = total - resolved;
  const critical = reports.filter(
    (r) => r.riskLevel === "Critical" && r.status !== "Resolved"
  ).length;

  const byDistrict = reports.reduce<Record<string, number>>((acc, r) => {
    const d = r.address?.district || "Unknown";
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {});
  const topDistricts = Object.entries(byDistrict)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <LogoutButton />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Total reports" value={total} />
        <Metric label="Open hazards" value={open} accent="text-amber-600" />
        <Metric label="Resolved" value={resolved} accent="text-green-600" />
        <Metric label="Critical (open)" value={critical} accent="text-red-600" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-xs text-slate-500">Avg. resolution time</p>
          <p className="text-lg font-bold text-slate-800">
            {avgResolutionDays(reports)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Districts reporting</p>
          <p className="text-lg font-bold text-slate-800">
            {Object.keys(byDistrict).length}
          </p>
        </div>
      </div>

      {/* District breakdown */}
      <div className="card">
        <p className="mb-2 text-sm font-semibold text-slate-700">
          District-wise breakdown
        </p>
        <div className="space-y-1">
          {topDistricts.map(([d, n]) => (
            <div key={d} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{d}</span>
              <span className="font-medium text-slate-800">{n}</span>
            </div>
          ))}
          {topDistricts.length === 0 && (
            <p className="text-sm text-slate-400">No data yet.</p>
          )}
        </div>
      </div>

      {/* Reports table */}
      <div className="card overflow-x-auto">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          Recent reports
        </p>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase text-slate-400">
              <th className="py-2 pr-3">Report ID</th>
              <th className="py-2 pr-3">District</th>
              <th className="py-2 pr-3">Risk</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Supports</th>
              <th className="py-2 pr-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <AdminReportRow key={r._id} report={r} />
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  No reports yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent = "text-slate-800",
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="card">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
