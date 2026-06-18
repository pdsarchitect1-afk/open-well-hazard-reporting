"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { riskColor } from "@/lib/risk";
import { RISK_LABELS, STATUS_LABELS } from "@/lib/i18n/mr";
import type { ReportDTO } from "@/lib/types";

const MH_CENTER: [number, number] = [19.0, 76.0];

// Zoom/pan the map to fit the current set of markers (e.g. after a search).
function FitBounds({ reports }: { reports: ReportDTO[] }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length === 0) return;
    const bounds = L.latLngBounds(
      reports.map((r) => [
        r.location.coordinates[1],
        r.location.coordinates[0],
      ])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [reports, map]);
  return null;
}

export default function PublicMapInner({ reports }: { reports: ReportDTO[] }) {
  return (
    <MapContainer
      center={MH_CENTER}
      zoom={7}
      scrollWheelZoom
      className="w-full rounded-xl"
      style={{ height: "70vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds reports={reports} />
      {reports.map((r) => {
        const [lng, lat] = r.location.coordinates;
        const resolved = r.status === "Resolved";
        const color = riskColor(r.riskLevel, resolved);
        return (
          <CircleMarker
            key={r._id}
            center={[lat, lng]}
            radius={9}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: color,
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{r.reportId}</p>
                <p>
                  {[r.address?.village, r.address?.district]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
                <p>
                  धोका: {RISK_LABELS[r.riskLevel]} · {STATUS_LABELS[r.status]}
                </p>
                <Link
                  href={`/well/${r.reportId}`}
                  className="text-brand underline"
                >
                  तपशील पहा →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
