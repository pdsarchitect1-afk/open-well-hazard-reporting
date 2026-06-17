"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhotoUpload from "@/components/PhotoUpload";
import MapPicker from "@/components/MapPicker";
import {
  ACCESSIBILITY,
  CONDITIONS,
  DEPTHS,
  JURISDICTIONS,
  RISK_FACTORS,
  WATER_PRESENT,
  WELL_TYPES,
} from "@/lib/constants";
import {
  mr,
  ACCESS_LABELS,
  CONDITION_LABELS,
  DEPTH_LABELS,
  JURISDICTION_LABELS,
  RISK_FACTOR_LABELS,
  WATER_LABELS,
  WELL_TYPE_LABELS,
} from "@/lib/i18n/mr";
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
  const [showMore, setShowMore] = useState(false);

  // optional detail fields
  const [description, setDescription] = useState("");
  const [wellType, setWellType] = useState("");
  const [condition, setCondition] = useState("");
  const [depth, setDepth] = useState("");
  const [waterPresent, setWaterPresent] = useState("");
  const [accessibility, setAccessibility] = useState("");
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [ownerName, setOwnerName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [sarpanch, setSarpanch] = useState("");
  const [gramSevak, setGramSevak] = useState("");
  const [corporator, setCorporator] = useState("");
  const [mla, setMla] = useState("");
  const [mp, setMp] = useState("");
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
    return () => window.removeEventListener("online", onOnline);
  }, [requestLocation]);

  const onPinMove = useCallback(
    (lat: number, lng: number) => {
      setCoords((prev) => ({ ...prev, lat, lng, acc: prev?.acc }));
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  function toggleFactor(f: string) {
    setRiskFactors((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

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
      wellType: clean(wellType) as any,
      condition: clean(condition) as any,
      depth: clean(depth) as any,
      waterPresent: clean(waterPresent) as any,
      accessibility: clean(accessibility) as any,
      riskFactors: riskFactors as any,
      responsible: {
        ownerName: clean(ownerName),
        jurisdiction: clean(jurisdiction) as any,
        sarpanch: clean(sarpanch),
        gramSevak: clean(gramSevak),
        corporator: clean(corporator),
        mla: clean(mla),
        mp: clean(mp),
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

        {geoStatus === "locating" && (
          <p className="mb-2 text-sm text-slate-500">⏳ {mr.form.locating}</p>
        )}
        {geoStatus === "denied" && (
          <p className="mb-2 text-sm text-amber-700">{mr.form.locationDenied}</p>
        )}

        {coords && (
          <>
            <p className="mb-2 text-xs text-slate-500">{mr.form.locationDrag}</p>
            <MapPicker lat={coords.lat} lng={coords.lng} onChange={onPinMove} />
            <div className="mt-3 flex flex-wrap gap-2">
              {address.district && <Chip>जिल्हा: {address.district}</Chip>}
              {address.taluka && <Chip>तालुका: {address.taluka}</Chip>}
              {address.village && <Chip>गाव: {address.village}</Chip>}
              <Chip>
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </Chip>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={requestLocation}
          className="btn-secondary mt-3 w-full"
        >
          🎯 {mr.form.locationGet}
        </button>
      </section>

      {/* 3. SUBMIT */}
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

            <SelectField
              label={mr.form.wellType}
              value={wellType}
              onChange={setWellType}
              options={WELL_TYPES.map((v) => [v, WELL_TYPE_LABELS[v]])}
            />
            <SelectField
              label={mr.form.condition}
              value={condition}
              onChange={setCondition}
              options={CONDITIONS.map((v) => [v, CONDITION_LABELS[v]])}
            />
            <SelectField
              label={mr.form.depth}
              value={depth}
              onChange={setDepth}
              options={DEPTHS.map((v) => [v, DEPTH_LABELS[v]])}
            />
            <SelectField
              label={mr.form.waterPresent}
              value={waterPresent}
              onChange={setWaterPresent}
              options={WATER_PRESENT.map((v) => [v, WATER_LABELS[v]])}
            />
            <SelectField
              label={mr.form.accessibility}
              value={accessibility}
              onChange={setAccessibility}
              options={ACCESSIBILITY.map((v) => [v, ACCESS_LABELS[v]])}
            />

            <Field label={mr.form.riskFactors}>
              <div className="grid grid-cols-2 gap-2">
                {RISK_FACTORS.map((f) => (
                  <label
                    key={f}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      riskFactors.includes(f)
                        ? "border-brand bg-brand/10 text-brand-dark"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={riskFactors.includes(f)}
                      onChange={() => toggleFactor(f)}
                    />
                    {RISK_FACTOR_LABELS[f]}
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={mr.form.landmark}>
                <input
                  className="field"
                  value={address.landmark ?? ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, landmark: e.target.value }))
                  }
                />
              </Field>
              <Field label={mr.form.surveyNumber}>
                <input
                  className="field"
                  value={address.surveyNumber ?? ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, surveyNumber: e.target.value }))
                  }
                />
              </Field>
              <Field label={mr.form.village}>
                <input
                  className="field"
                  value={address.village ?? ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, village: e.target.value }))
                  }
                />
              </Field>
              <Field label={mr.form.taluka}>
                <input
                  className="field"
                  value={address.taluka ?? ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, taluka: e.target.value }))
                  }
                />
              </Field>
              <Field label={mr.form.district}>
                <input
                  className="field"
                  value={address.district ?? ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, district: e.target.value }))
                  }
                />
              </Field>
              <Field label={mr.form.pin}>
                <input
                  className="field"
                  inputMode="numeric"
                  value={address.pin ?? ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, pin: e.target.value }))
                  }
                />
              </Field>
            </div>

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
              <SelectField
                label={mr.form.jurisdiction}
                value={jurisdiction}
                onChange={setJurisdiction}
                options={JURISDICTIONS.map((v) => [v, JURISDICTION_LABELS[v]])}
              />
              <Field label={mr.form.sarpanch}>
                <input
                  className="field"
                  value={sarpanch}
                  onChange={(e) => setSarpanch(e.target.value)}
                />
              </Field>
              <Field label={mr.form.gramSevak}>
                <input
                  className="field"
                  value={gramSevak}
                  onChange={(e) => setGramSevak(e.target.value)}
                />
              </Field>
              <Field label={mr.form.corporator}>
                <input
                  className="field"
                  value={corporator}
                  onChange={(e) => setCorporator(e.target.value)}
                />
              </Field>
              <Field label={mr.form.mla}>
                <input
                  className="field"
                  value={mla}
                  onChange={(e) => setMla(e.target.value)}
                />
              </Field>
              <Field label={mr.form.mp}>
                <input
                  className="field"
                  value={mp}
                  onChange={(e) => setMp(e.target.value)}
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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Field label={label}>
      <select
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{mr.common.select}</option>
        {options.map(([val, lbl]) => (
          <option key={val} value={val}>
            {lbl}
          </option>
        ))}
      </select>
    </Field>
  );
}
