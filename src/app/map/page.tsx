"use client";

import { useEffect, useMemo, useState } from "react";
import PublicMap from "@/components/PublicMap";
import { DISTRICTS, RISK_LEVELS, STATUSES } from "@/lib/constants";
import {
  mr,
  RISK_LABELS,
  STATUS_LABELS,
} from "@/lib/i18n/mr";
import type { ReportDTO } from "@/lib/types";

const LEGEND: { color: string; label: string }[] = [
  { color: "#dc2626", label: "अति गंभीर" },
  { color: "#f97316", label: "जास्त" },
  { color: "#eab308", label: "मध्यम" },
  { color: "#16a34a", label: "कमी / सोडवले" },
];

export default function MapPage() {
  const [reports, setReports] = useState<ReportDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState("");
  const [status, setStatus] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/reports?limit=5000")
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (!risk || r.riskLevel === risk) &&
          (!status || r.status === status) &&
          (!district || r.address?.district === district)
      ),
    [reports, risk, status, district]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">{mr.map.title}</h1>
        <span className="text-sm text-slate-500">
          {mr.map.count(filtered.length)}
        </span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-2">
        <select
          className="field !py-2 text-sm"
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
        >
          <option value="">{mr.map.filterRisk}: {mr.map.all}</option>
          {RISK_LEVELS.map((r) => (
            <option key={r} value={r}>
              {RISK_LABELS[r]}
            </option>
          ))}
        </select>
        <select
          className="field !py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">{mr.map.filterStatus}: {mr.map.all}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          className="field !py-2 text-sm"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">{mr.map.filterDistrict}: {mr.map.all}</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            {l.label}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="flex h-[70vh] items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          {mr.map.loading}
        </div>
      ) : (
        <PublicMap reports={filtered} />
      )}
    </div>
  );
}
