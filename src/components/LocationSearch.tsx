"use client";

import { useEffect, useRef, useState } from "react";
import { mr } from "@/lib/i18n/mr";

interface Result {
  display_name: string;
  lat: number;
  lng: number;
}

// A place-search box for the report form: type a village/landmark, pick a
// result, and the map pin jumps there (user can then drag to fine-tune).
export default function LocationSearch({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // debounced search
  useEffect(() => {
    if (q.trim().length < 3) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [q]);

  // close dropdown on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative mb-3" ref={boxRef}>
      <div className="relative">
        <input
          className="field pr-9"
          placeholder={`🔍 ${mr.form.locationSearchPh}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            ⏳
          </span>
        )}
      </div>

      {open && (results.length > 0 || searched) && (
        <ul className="absolute z-[1200] mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((r, i) => (
            <li key={i} className="border-b border-slate-100 last:border-0">
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  onSelect(r.lat, r.lng);
                  setQ(r.display_name.split(",").slice(0, 2).join(", "));
                  setOpen(false);
                }}
              >
                {r.display_name}
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-400">
              {mr.form.locationSearchNone}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
