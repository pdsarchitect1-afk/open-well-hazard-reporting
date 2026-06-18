"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import MapPicker from "@/components/MapPicker";
import LocationSearch from "@/components/LocationSearch";
import { mr, RISK_LABELS } from "@/lib/i18n/mr";
import { RISK_LEVELS } from "@/lib/constants";
import { riskColor } from "@/lib/risk";
import type { Address, Photo } from "@/lib/types";
import {
  flushPending,
  savePending,
  type PendingReport,
} from "@/lib/offline";

// default centre: roughly Maharashtra
const DEFAULT_CENTER = { lat: 19.7515, lng: 75.7139 };

export default function ReportPage() {
  const router = useRouter();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc?: number } | null>(
    null
  );
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "ok" | "denied">(
    "idle"
  );
  const [address, setAddress] = useState<Address>({});
  const [riskLevel, setRiskLevel] = useState("");
  const [pinTouched, setPinTouched] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // latest geoStatus for use inside event listeners without re-subscribing
  const geoStatusRef = useRef(geoStatus);
  geoStatusRef.current = geoStatus;

  // true once we have a real location (GPS success or the user placed the pin)
  const located = geoStatus === "ok" || pinTouched;

  // optional detail fields
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<any | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.address) {
        setAddress((prev) => ({
          ...prev,
          district: data.address.district || prev.district,
          taluka: data.address.taluka || prev.taluka,
          village: data.address.village || prev.village,
          pin: data.address.pin || prev.pin,
          road: data.address.road || prev.road,
        }));
      }
    } catch {
      /* geocode is best-effort */
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("denied");
      setCoords(DEFAULT_CENTER);
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy,
        };
        setCoords(c);
        setGeoStatus("ok");
        reverseGeocode(c.lat, c.lng);
      },
      () => {
        setGeoStatus("denied");
        setCoords(DEFAULT_CENTER);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [reverseGeocode]);

  // auto-request location + flush any offline-queued reports on load
  useEffect(() => {
    requestLocation();
    flushPending();
    const onOnline = () => flushPending();
    window.addEventListener("online", onOnline);
    // If the first attempt was denied/unavailable (e.g. device location was
    // off), retry when the user comes back to the tab after enabling it.
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        geoStatusRef.current === "denied"
      ) {
        requestLocation();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [requestLocation]);

  const onPinMove = useCallback(
    (lat: number, lng: number) => {
      setCoords((prev) => ({ ...prev, lat, lng, acc: prev?.acc }));
      setPinTouched(true);
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  function buildPayload(force = false): PendingReport {
    const clean = (v: string) => (v.trim() ? v.trim() : undefined);
    return {
      lat: coords!.lat,
      lng: coords!.lng,
      accuracyMeters: coords!.acc,
      photos,
      address: {
        district: clean(address.district ?? ""),
        taluka: clean(address.taluka ?? ""),
        village: clean(address.village ?? ""),
        landmark: clean(address.landmark ?? ""),
        road: clean(address.road ?? ""),
        surveyNumber: clean(address.surveyNumber ?? ""),
        pin: clean(address.pin ?? ""),
      },
      description: clean(description),
      riskLevel: clean(riskLevel) as any,
      riskFactors: [],
      responsible: {
        ownerName: clean(ownerName),
        responsiblePerson: clean(responsiblePerson),
      },
      reporter: {
        name: clean(reporterName),
        phone: clean(reporterPhone),
      },
      force,
    };
  }

  async function submit(force = false) {
    if (!coords || photos.length === 0) {
      setError(mr.form.needPhotoLocation);
      return;
    }
    setError(null);
    setSubmitting(true);
    const payload = buildPayload(force);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        const data = await res.json();
        setDuplicate(data.existing);
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.issues ? JSON.stringify(data.issues) : mr.common.error);
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      router.push(`/well/${data.reportId}?new=1`);
    } catch {
      // Likely offline — queue and inform the user.
      savePending(payload);
      setSubmitting(false);
      setError(mr.common.offlineSaved);
    }
  }

  async function supportExisting() {
    if (!duplicate) return;
    try {
      await fetch(`/api/reports/${duplicate.reportId}/support`, {
        method: "POST",
      });
    } catch {
      /* ignore */
    }
    router.push(`/well/${duplicate.reportId}`);
  }

  const canSubmit = coords && photos.length > 0 && !submitting;

  if (duplicate) {
    return (
      <div className="space-y-4">
        <div className="card border-amber-300 bg-amber-50">
          <h2 className="text-lg font-bold text-amber-900">
            {mr.form.duplicateTitle}
          </h2>
          <p className="mt-1 text-sm text-amber-900">{mr.form.duplicateBody}</p>
          {duplicate.address?.village && (
            <p className="mt-2 text-sm text-slate-700">
              📍 {duplicate.address.village} {duplicate.address.district}
            </p>
          )}
        </div>
        <button onClick={supportExisting} className="btn-primary w-full">
          👍 {mr.form.duplicateSupport}
        </button>
        <Link
          href={`/well/${duplicate.reportId}`}
          className="btn-secondary w-full"
        >
          {mr.form.duplicateView}
        </Link>
        <button
          onClick={() => {
            setDuplicate(null);
            submit(true);
          }}
          className="w-full text-center text-sm text-slate-500 underline"
        >
          {mr.form.duplicateNew}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{mr.form.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{mr.form.subtitle}</p>
      </div>

      {/* 1. PHOTO (required) */}
      <section className="card">
        <h2 className="label flex items-center gap-1 text-base">
          📷 {mr.form.photoLabel}
          <span className="text-red-500">*</span>
        </h2>
        <p className="mb-3 text-xs text-slate-500">{mr.form.photoHint}</p>
        <PhotoUpload photos={photos} onChange={setPhotos} />
      </section>

      {/* 2. LOCATION (required) */}
      <section className="card">
        <h2 className="label flex items-center gap-1 text-base">
          📍 {mr.form.locationLabel}
          <span className="text-red-500">*</span>
        </h2>

        <LocationSearch onSelect={onPinMove} />

        {geoStatus === "locating" && (
          <p className="mb-2 text-sm text-slate-500">⏳ {mr.form.locating}</p>
        )}
        {geoStatus === "denied" && (
          <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">📍 {mr.form.locationOffTitle}</p>
            <p className="mt-1">{mr.form.locationDenied}</p>
          </div>
        )}

        {coords && (
          <>
            <p className="mb-2 text-xs text-slate-500">{mr.form.locationDrag}</p>
            <MapPicker lat={coords.lat} lng={coords.lng} onChange={onPinMove} />

            {/* Confirm location only once we actually have one. */}
            {located && (
              <div
                className={`mt-3 rounded-lg border px-3 py-2 text-sm font-medium ${
                  photos.length > 0
                    ? "border-green-300 bg-green-50 text-green-800"
                    : "border-amber-300 bg-amber-50 text-amber-900"
                }`}
              >
                ✅ {mr.form.locationSet} —{" "}
                {photos.length > 0
                  ? mr.form.locationSetReady
                  : mr.form.locationSetAddPhoto}
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              {address.district && <Chip>जिल्हा: {address.district}</Chip>}
              {address.taluka && <Chip>तालुका: {address.taluka}</Chip>}
              {address.village && <Chip>गाव: {address.village}</Chip>}
              <Chip>
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </Chip>
            </div>
          </>
        )}

        {/* Prominent "get my location" until we actually have one; afterwards
            a small secondary link so it doesn't look like a required step. */}
        {located ? (
          <button
            type="button"
            onClick={requestLocation}
            className="mx-auto mt-3 block text-sm text-slate-500 underline underline-offset-2"
          >
            🎯 {mr.form.locationRecenter}
          </button>
        ) : (
          <button
            type="button"
            onClick={requestLocation}
            className="btn-secondary mt-3 w-full"
          >
            🎯 {mr.form.locationGet}
          </button>
        )}
      </section>

      {/* RISK LEVEL (reporter's choice) */}
      <section className="card">
        <h2 className="label flex items-center gap-1 text-base">
          ⚠️ {mr.form.riskLevelLabel}
        </h2>
        <p className="mb-3 text-xs text-slate-500">{mr.form.riskLevelHint}</p>
        <div className="grid grid-cols-2 gap-2">
          {RISK_LEVELS.map((level) => {
            const selected = riskLevel === level;
            const color = riskColor(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => setRiskLevel(selected ? "" : level)}
                className="flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-base font-semibold transition active:scale-[0.99]"
                style={{
                  borderColor: color,
                  backgroundColor: selected ? color : "transparent",
                  color: selected ? "#fff" : color,
                }}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: selected ? "#fff" : color }}
                />
                {RISK_LABELS[level]}
              </button>
            );
          })}
        </div>
      </section>

      {/* MORE DETAILS (optional, collapsed) */}
      <section className="card">
        <button
          type="button"
          onClick={() => setShowMore((s) => !s)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="text-base font-semibold text-slate-800">
            ➕ {mr.form.moreDetails}
          </span>
          <span className="text-slate-400">{showMore ? "▲" : "▼"}</span>
        </button>

        {showMore && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-slate-500">{mr.form.moreDetailsHint}</p>

            <Field label={mr.form.description}>
              <textarea
                className="field"
                rows={2}
                placeholder={mr.form.descriptionPh}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            {/* Responsible parties */}
            <h3 className="pt-2 text-sm font-semibold text-slate-700">
              {mr.form.responsibleTitle}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label={mr.form.ownerName}>
                <input
                  className="field"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </Field>
              <Field label={mr.form.responsiblePerson}>
                <input
                  className="field"
                  placeholder={mr.form.responsiblePersonPh}
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                />
              </Field>
            </div>

            {/* Reporter (optional) */}
            <h3 className="pt-2 text-sm font-semibold text-slate-700">
              {mr.form.reporterTitle}
            </h3>
            <p className="text-xs text-slate-500">{mr.form.reporterHint}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label={mr.form.reporterName}>
                <input
                  className="field"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                />
              </Field>
              <Field label={mr.form.reporterPhone}>
                <input
                  className="field"
                  inputMode="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}
      </section>

      {/* SUBMIT (at the bottom) */}
      <button
        onClick={() => submit(false)}
        disabled={!canSubmit}
        className="btn-primary w-full"
      >
        {submitting ? mr.form.submitting : `✅ ${mr.form.submit}`}
      </button>
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
      {children}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
