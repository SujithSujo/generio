"use client";

import { useEffect, useState } from "react";
import {
  adminInputClass,
  adminSecondaryButtonClass,
} from "@/components/admin/AdminUI";
import { fetchAdminMedia, uploadAdminMedia, type AdminMedia } from "@/lib/content-admin-api";

type MediaPickerProps = {
  accessToken: string | null;
  value: string | null;
  onChange: (mediaId: string | null) => void;
  disabled?: boolean;
  label?: string;
};

export function MediaPicker({
  accessToken,
  value,
  onChange,
  disabled,
  label = "Media asset",
}: MediaPickerProps) {
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!accessToken || !open) return;
    fetchAdminMedia(accessToken)
      .then(setItems)
      .catch(() => setError("Unable to load media library."));
  }, [accessToken, open]);

  const selected = items.find((item) => item.id === value);

  async function onFileChange(file: File | null) {
    if (!file || !accessToken || disabled) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadAdminMedia(accessToken, file);
      setItems((prev) => [uploaded, ...prev]);
      onChange(uploaded.id);
      setOpen(false);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={selected?.originalFileName ?? value ?? ""}
          placeholder={`${label} (optional)`}
          className={adminInputClass}
        />
        <button
          type="button"
          disabled={disabled || !accessToken}
          onClick={() => setOpen((v) => !v)}
          className={adminSecondaryButtonClass}
        >
          {open ? "Close picker" : "Browse media"}
        </button>
        {value ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            className={adminSecondaryButtonClass}
          >
            Clear
          </button>
        ) : null}
      </div>
      {selected?.publicUrl && selected.mimeType.startsWith("image/") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={selected.publicUrl} alt={selected.altText ?? selected.originalFileName} className="h-16 w-16 rounded object-cover" />
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {open ? (
        <div className="space-y-3 rounded-md border border-[var(--border)] p-3">
          <label className="block text-xs font-medium text-[var(--ink-muted)]">
            Quick upload
            <input
              type="file"
              accept="image/*,application/pdf,video/mp4"
              disabled={disabled || uploading}
              className="mt-1 block w-full text-sm"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="max-h-48 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-1 py-3 text-sm text-[var(--ink-muted)]">No media yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        onChange(item.id);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-2 py-2 text-left text-sm hover:bg-[var(--surface-muted)] ${
                        value === item.id ? "bg-[var(--brand-primary-light)]" : ""
                      }`}
                    >
                      {item.publicUrl && item.mimeType.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.publicUrl} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <span className="grid h-10 w-10 place-items-center rounded bg-[var(--surface-muted)] text-[10px]">
                          FILE
                        </span>
                      )}
                      <span>
                        <span className="block font-medium text-[var(--ink)]">{item.originalFileName}</span>
                        <span className="block text-xs text-[var(--ink-muted)]">{item.mimeType}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
