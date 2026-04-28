"use client";

import { useRef, useState, type ChangeEvent } from "react";

interface ImageUploaderProps {
  value: string | null;
  alt: string;
  onChange: (next: { url: string | null; alt: string }) => void;
}

export function ImageUploader({ value, alt, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Échec de l'envoi.");
        setUploading(false);
        return;
      }
      const json = (await res.json()) as { url: string };
      onChange({ url: json.url, alt });
    } catch {
      setError("Échec de l'envoi.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={alt || "Aperçu"}
            className="h-24 w-40 rounded-md border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-24 w-40 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
            Pas d&apos;image
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onFileSelected}
            disabled={uploading}
            className="block text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange({ url: null, alt: "" })}
              className="text-xs text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
            >
              Retirer l&apos;image
            </button>
          ) : null}
          <p className="text-xs text-slate-500">
            PNG, JPG ou WebP. Taille maximale 2 Mo.
          </p>
        </div>
      </div>

      {value ? (
        <div>
          <label
            htmlFor="cover-alt"
            className="block text-sm font-medium text-slate-700"
          >
            Texte alternatif (accessibilité, requis)
          </label>
          <input
            id="cover-alt"
            type="text"
            value={alt}
            onChange={(e) => onChange({ url: value, alt: e.target.value })}
            className="mt-1 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ex. : équipe Alliance Consultants en réunion"
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
