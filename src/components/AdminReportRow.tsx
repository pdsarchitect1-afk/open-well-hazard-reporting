"use client";

import { useRouter } from "next/navigation";
import { riskColor } from "@/lib/risk";
import type { ReportDTO } from "@/lib/types";

// A clickable table row for the admin dashboard — navigates to the report
// detail when any part of the row is clicked.
export default function AdminReportRow({ report }: { report: ReportDTO }) {
  const router = useRouter();
  return (
    <tr
      onClick={() => router.push(`/admin/${report.reportId}`)}
      className="cursor-pointer border-b last:border-0 hover:bg-slate-50"
    >
      <td className="py-2 pr-3 font-medium text-brand-dark underline">
        {report.reportId}
      </td>
      <td className="py-2 pr-3 text-slate-600">
        {report.address?.district || "—"}
      </td>
      <td className="py-2 pr-3">
        <span
          className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-semibold leading-none text-white"
          style={{ backgroundColor: riskColor(report.riskLevel) }}
        >
          {report.riskLevel}
        </span>
      </td>
      <td className="py-2 pr-3 text-slate-600">{report.status}</td>
      <td className="py-2 pr-3 text-slate-600">{report.supports}</td>
      <td className="py-2 pr-3 text-slate-500">
        {new Date(report.createdAt).toLocaleDateString("en-IN")}
      </td>
    </tr>
  );
}
