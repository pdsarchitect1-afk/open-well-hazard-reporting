"use client";

import { useRef, useState } from "react";
import { compressAndUpload, isCloudinaryConfigured } from "@/lib/cloudinary";
import { mr } from "@/lib/i18n/mr";
import type { Photo } from "@/lib/types";

export default function PhotoUpload({
  photos,
  onChange,
}: {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isCloudinaryConfigured();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: Photo[] = [];
      for (const file of Array.from(files)) {
        const photo = await compressAndUpload(file);
        uploaded.push(photo);
      }
      onChange([...photos, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : mr.common.error);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(idx: number) {
    onChange(photos.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {photos.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt=""
                className="h-24 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow"
                aria-label="remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={uploading || !configured}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/40 bg-brand/5 px-4 py-6 text-base font-semibold text-brand-dark active:scale-[0.99] disabled:opacity-60"
      >
        {uploading ? (
          <>⏳ {mr.form.photoUploading}</>
        ) : photos.length > 0 ? (
          <>➕ {mr.form.photoAnother}</>
        ) : (
          <>📷 {mr.form.photoAdd}</>
        )}
      </button>

      {!configured && (
        <p className="mt-2 text-xs text-amber-700">
          ⚠️ Cloudinary configure केलेले नाही (.env.local तपासा).
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
