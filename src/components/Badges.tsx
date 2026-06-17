import type { RiskLevel, Status } from "@/lib/constants";
import { riskColor } from "@/lib/risk";
import { RISK_LABELS, STATUS_LABELS } from "@/lib/i18n/mr";

export function RiskBadge({
  level,
  resolved,
}: {
  level: RiskLevel;
  resolved?: boolean;
}) {
  const color = riskColor(level, resolved);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {RISK_LABELS[level]}
    </span>
  );
}

const STATUS_STYLE: Record<Status, string> = {
  Reported: "bg-slate-100 text-slate-700",
  "Under Review": "bg-blue-100 text-blue-700",
  Assigned: "bg-indigo-100 text-indigo-700",
  "Work Scheduled": "bg-purple-100 text-purple-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-green-100 text-green-700",
  Reopened: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
