"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUSES } from "@/lib/constants";
import type { ReportDTO } from "@/lib/types";

export default function AdminReportManager({ report }: { report: ReportDTO }) {
  const router = useRouter();
  const [status, setStatus] = useState(report.status);
  const [note, setNote] = useState("");
  const [authName, setAuthName] = useState("");
  const [authRole, setAuthRole] = useState("");
  const [authContact, setAuthContact] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    const body: Record<string, unknown> = { status, by: "admin" };
    if (note.trim()) body.note = note.trim();
    if (authName.trim() && authRole.trim()) {
      body.assignedAuthority = {
        name: authName.trim(),
        role: authRole.trim(),
        contact: authContact.trim() || undefined,
      };
    }
    try {
      const res = await fetch(`/api/reports/${report.reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setMsg("Saved.");
        setNote("");
        setAuthName("");
        setAuthRole("");
        setAuthContact("");
        router.refresh();
      } else {
        setMsg("Failed to save.");
      }
    } catch {
      setMsg("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card space-y-4">
      <p className="text-sm font-semibold text-slate-700">Manage report</p>

      <div>
        <label className="label">Status</label>
        <select
          className="field"
          value={status}
          onChange={(e) => setStatus(e.target.value as ReportDTO["status"])}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Note (optional)</label>
        <textarea
          className="field"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Work order issued to Gram Panchayat"
        />
      </div>

      <div>
        <label className="label">Assign authority (optional)</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            className="field"
            placeholder="Name"
            value={authName}
            onChange={(e) => setAuthName(e.target.value)}
          />
          <input
            className="field"
            placeholder="Role"
            value={authRole}
            onChange={(e) => setAuthRole(e.target.value)}
          />
          <input
            className="field"
            placeholder="Contact"
            value={authContact}
            onChange={(e) => setAuthContact(e.target.value)}
          />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? "Saving..." : "Save changes"}
      </button>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
