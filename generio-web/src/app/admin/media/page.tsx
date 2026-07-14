"use client";

import { FormEvent, useRef, useState } from "react";
import {
  AdminDenied,
  AdminField,
  AdminFlash,
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
  AdminTable,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/AdminUI";
import { useAuth } from "@/lib/auth-context";
import {
  AdminMedia,
  deleteAdminMedia,
  errorMessage,
  fetchAdminMedia,
  updateAdminMedia,
  uploadAdminMedia,
} from "@/lib/content-admin-api";
import { useAdminFetch } from "@/lib/use-admin-loader";

export default function AdminMediaPage() {
  const { accessToken, hasPermission } = useAuth();
  const canEdit = hasPermission("Media.Edit");
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [altText, setAltText] = useState("");
  const [editing, setEditing] = useState<AdminMedia | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!accessToken) return;
    setItems(await fetchAdminMedia(accessToken));
  }

  useAdminFetch(
    Boolean(accessToken && hasPermission("Media.View")),
    () => fetchAdminMedia(accessToken!),
    setItems,
    setError,
    "Unable to load media.",
    [accessToken, hasPermission],
  );

  async function onUpload(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canEdit) return;
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await uploadAdminMedia(accessToken, file, altText);
      setMessage("File uploaded.");
      setAltText("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (err) {
      setError(errorMessage(err, "Unable to upload file."));
    } finally {
      setSaving(false);
    }
  }

  async function onSaveMeta(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canEdit || !editing) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateAdminMedia(accessToken, editing.id, {
        fileName: editing.fileName,
        originalFileName: editing.originalFileName,
        mimeType: editing.mimeType,
        storageProvider: editing.storageProvider,
        storagePath: editing.storagePath,
        publicUrl: editing.publicUrl,
        altText: editing.altText,
        width: editing.width,
        height: editing.height,
        fileSize: editing.fileSize,
      });
      setMessage("Media updated.");
      setEditing(null);
      await load();
    } catch (err) {
      setError(errorMessage(err, "Unable to update media."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!accessToken || !canEdit) return;
    try {
      await deleteAdminMedia(accessToken, id);
      setMessage("Media deactivated.");
      if (editing?.id === id) setEditing(null);
      await load();
    } catch (err) {
      setError(errorMessage(err, "Unable to deactivate media."));
    }
  }

  if (!hasPermission("Media.View")) return <AdminDenied resource="media" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Media library"
        description="Upload images and documents. Raster images are optimized to WebP (max 2400px)."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminTable headers={["Preview", "File", "Size", "Status", ""]} empty={items.length ? undefined : "No media yet — upload your first asset."}>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-2">
                {item.publicUrl && item.mimeType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.publicUrl} alt={item.altText ?? item.originalFileName} className="h-12 w-12 rounded object-cover" />
                ) : (
                  <span className="text-xs text-[var(--ink-muted)]">File</span>
                )}
              </td>
              <td className="px-4 py-2">
                <p className="font-medium">{item.originalFileName}</p>
                <p className="max-w-xs truncate text-xs text-[var(--ink-muted)]">{item.publicUrl ?? item.storagePath}</p>
              </td>
              <td className="px-4 py-2 text-[var(--ink-muted)]">
                {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                {(item.fileSize / 1024).toFixed(1)} KB
              </td>
              <td className="px-4 py-2">
                <AdminStatusPill active={!item.isDeleted} />
              </td>
              <td className="px-4 py-2 text-right">
                <button type="button" onClick={() => setEditing(item)} className="text-sm font-semibold text-[var(--brand-deep)] hover:underline">
                  Edit
                </button>
                {canEdit ? (
                  <button type="button" onClick={() => onDelete(item.id)} className="ml-3 text-sm text-red-600 hover:underline">
                    Delete
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </AdminTable>

        <div className="space-y-6">
          <AdminPanel title="Upload file">
            <form onSubmit={onUpload} className="space-y-4">
              <AdminField label="File" hint="JPEG, PNG, WebP, GIF, PDF, or MP4 up to 15 MB.">
                <input ref={fileRef} type="file" disabled={!canEdit} accept="image/*,application/pdf,video/mp4" className={adminInputClass} />
              </AdminField>
              <AdminField label="Alt text">
                <input disabled={!canEdit} value={altText} onChange={(e) => setAltText(e.target.value)} className={adminInputClass} />
              </AdminField>
              <AdminFlash message={message} error={error} />
              {canEdit ? (
                <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                  {saving ? "Uploading…" : "Upload"}
                </button>
              ) : null}
            </form>
          </AdminPanel>

          {editing ? (
            <AdminPanel title="Edit media metadata">
              <form onSubmit={onSaveMeta} className="space-y-4">
                <AdminField label="Original file name">
                  <input
                    disabled={!canEdit}
                    value={editing.originalFileName}
                    onChange={(e) => setEditing({ ...editing, originalFileName: e.target.value })}
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Alt text">
                  <input
                    disabled={!canEdit}
                    value={editing.altText ?? ""}
                    onChange={(e) => setEditing({ ...editing, altText: e.target.value })}
                    className={adminInputClass}
                  />
                </AdminField>
                <AdminField label="Public URL">
                  <input
                    disabled={!canEdit}
                    value={editing.publicUrl ?? ""}
                    onChange={(e) => setEditing({ ...editing, publicUrl: e.target.value })}
                    className={adminInputClass}
                  />
                </AdminField>
                <div className="flex gap-2">
                  {canEdit ? (
                    <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                      Save metadata
                    </button>
                  ) : null}
                  <button type="button" onClick={() => setEditing(null)} className={adminSecondaryButtonClass}>
                    Cancel
                  </button>
                </div>
              </form>
            </AdminPanel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
