"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { RiskBadge, StatusBadge } from "@/components/Badges";
import { mr, STATUS_LABELS } from "@/lib/i18n/mr";
import type { ReportDTO } from "@/lib/types";

export default function WellDetailPage() {
  const params = useParams<{ reportId: string }>();
  const search = useSearchParams();
  const isNew = search.get("new") === "1";

  const [report, setReport] = useState<ReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(false);
  const [supports, setSupports] = useState(0);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href.split("?")[0]);
    fetch(`/api/reports/${params.reportId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.report) {
          setReport(d.report);
          setSupports(d.report.supports ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }, [params.reportId]);

  async function support() {
    setSupported(true);
    setSupports((s) => s + 1);
    try {
      const res = await fetch(`/api/reports/${params.reportId}/support`, {
        method: "POST",
      });
      const d = await res.json();
      if (typeof d.supports === "number") setSupports(d.supports);
    } catch {
      /* ignore */
    }
  }

  if (loading) {
    return <p className="py-10 text-center text-slate-400">{mr.common.loading}</p>;
  }
  if (!report) {
    return (
      <div className="py-10 text-center">
        <p className="text-slate-500">{mr.detail.notFound}</p>
        <Link href="/" className="mt-4 inline-block text-brand underline">
          {mr.nav.home}
        </Link>
      </div>
    );
  }

  const [lng, lat] = report.location.coordinates;
  const resolved = report.status === "Resolved";

  return (
    <div className="space-y-5">
      {isNew && (
        <div className="rounded-2xl border border-green-300 bg-green-50 p-4 text-center">
          <p className="text-lg font-bold text-green-800">✅ {mr.success.title}</p>
          <p className="mt-1 text-sm text-green-700">{mr.success.body}</p>
        </div>
      )}

      {/* ID + QR */}
      <div className="card text-center">
        <p className="text-xs text-slate-500">{mr.success.yourId}</p>
        <p className="select-all text-xl font-bold tracking-wide text-brand-dark">
          {report.reportId}
        </p>
        {pageUrl && (
          <div className="mt-3 flex flex-col items-center">
            <QRCodeSVG value={pageUrl} size={120} />
            <p className="mt-2 text-xs text-slate-400">{mr.success.qrHint}</p>
          </div>
        )}
      </div>

      {/* Status + risk */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{mr.detail.status}</p>
          <div className="mt-1">
            <StatusBadge status={report.status} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{mr.detail.risk}</p>
          <div className="mt-1">
            <RiskBadge level={report.riskLevel} resolved={resolved} />
          </div>
        </div>
      </div>

      {/* Photos */}
      {report.photos.length > 0 && (
        <div className="card">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            {mr.detail.photos}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {report.photos.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt=""
                  className="h-24 w-full rounded-lg object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Location */}
      <div className="card">
        <p className="mb-1 text-sm font-semibold text-slate-700">
          {mr.detail.location}
        </p>
        <p className="text-sm text-slate-600">
          {[report.address?.village, report.address?.taluka, report.address?.district]
            .filter(Boolean)
            .join(", ") || "—"}
        </p>
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm text-brand underline"
        >
          {mr.detail.openInMaps} →
        </a>
      </div>

      {/* Support */}
      <div className="card text-center">
        <p className="text-sm text-slate-600">
          {mr.detail.supports}: <strong>{supports}</strong>
        </p>
        <button
          onClick={support}
          disabled={supported}
          className="btn-secondary mt-2 w-full disabled:opacity-60"
        >
          {supported ? `🙏 ${mr.detail.supported}` : `👍 ${mr.detail.support}`}
        </button>
      </div>

      {/* Authorities */}
      {report.suggestedAuthorities?.length > 0 && (
        <div className="card">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            {mr.detail.authorities}
          </p>
          <ul className="space-y-2">
            {report.suggestedAuthorities.map((a, i) => (
              <li key={i} className="text-sm text-slate-600">
                • {a.name}
                <span className="text-slate-400"> — {a.role}</span>
                {a.contact && (
                  <span className="block text-xs text-slate-400">
                    📞 {a.contact}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline */}
      {report.statusHistory?.length > 0 && (
        <div className="card">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            {mr.detail.timeline}
          </p>
          <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
            {report.statusHistory.map((e, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-brand" />
                <p className="text-sm font-medium text-slate-700">
                  {STATUS_LABELS[e.status]}
                </p>
                {e.note && <p className="text-xs text-slate-500">{e.note}</p>}
                <p className="text-xs text-slate-400">
                  {new Date(e.at).toLocaleString("mr-IN")}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/report" className="btn-secondary flex-1">
          {mr.success.reportAnother}
        </Link>
        <Link href="/map" className="btn-secondary flex-1">
          {mr.nav.map}
        </Link>
      </div>
    </div>
  );
}
