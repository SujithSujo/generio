"use client";

import { FormEvent, useState } from "react";
import { MediaPicker } from "@/components/admin/MediaPicker";
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
  adminTextareaClass,
} from "@/components/admin/AdminUI";
import { useAuth } from "@/lib/auth-context";
import {
  AdminIndustry,
  UpsertIndustryPayload,
  createAdminIndustry,
  errorMessage,
  fetchAdminIndustries,
  toSlug,
  updateAdminIndustry,
} from "@/lib/content-admin-api";
import { useAdminFetch } from "@/lib/use-admin-loader";

function emptyForm(): UpsertIndustryPayload {
  return {
    name: "",
    slug: "",
    shortDescription: "",
    icon: "",
    imageId: null,
    displayOrder: 1,
    isActive: true,
  };
}

export default function AdminIndustriesPage() {
  const { accessToken, hasPermission } = useAuth();
  const canEdit = hasPermission("Industries.Edit");
  const [items, setItems] = useState<AdminIndustry[]>([]);
  const [form, setForm] = useState<UpsertIndustryPayload>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!accessToken) return;
    setItems(await fetchAdminIndustries(accessToken));
  }

  useAdminFetch(
    Boolean(accessToken && hasPermission("Industries.View")),
    () => fetchAdminIndustries(accessToken!),
    setItems,
    setError,
    "Unable to load industries.",
    [accessToken, hasPermission],
  );

  function edit(item: AdminIndustry) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      shortDescription: item.shortDescription ?? "",
      icon: item.icon ?? "",
      imageId: item.imageId,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canEdit) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    const payload = {
      ...form,
      slug: form.slug?.trim() || toSlug(form.name),
      imageId: form.imageId || null,
    };
    try {
      if (editingId) await updateAdminIndustry(accessToken, editingId, payload);
      else await createAdminIndustry(accessToken, payload);
      setMessage(editingId ? "Industry updated." : "Industry created.");
      reset();
      await load();
    } catch (err) {
      setError(errorMessage(err, "Unable to save industry."));
    } finally {
      setSaving(false);
    }
  }

  if (!hasPermission("Industries.View")) return <AdminDenied resource="industries" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Industries"
        description="Verticals Generio supports across emerging markets."
        actions={
          canEdit ? (
            <button type="button" onClick={reset} className={adminSecondaryButtonClass}>
              New industry
            </button>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminTable headers={["Order", "Name", "Slug", "Status", ""]} empty={items.length ? undefined : "No industries yet."}>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-2 text-[var(--ink-muted)]">{item.displayOrder}</td>
              <td className="px-4 py-2 font-medium">{item.name}</td>
              <td className="px-4 py-2 text-[var(--ink-muted)]">{item.slug}</td>
              <td className="px-4 py-2">
                <AdminStatusPill active={item.isActive} />
              </td>
              <td className="px-4 py-2 text-right">
                <button type="button" onClick={() => edit(item)} className="text-sm font-semibold text-[var(--brand-deep)] hover:underline">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>

        <AdminPanel title={editingId ? "Edit industry" : "Create industry"}>
          <form onSubmit={onSubmit} className="space-y-4">
            <AdminField label="Name">
              <input required disabled={!canEdit} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Slug">
              <input disabled={!canEdit} value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Short description">
              <textarea disabled={!canEdit} value={form.shortDescription ?? ""} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className={adminTextareaClass} />
            </AdminField>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Icon key">
                <input disabled={!canEdit} value={form.icon ?? ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={adminInputClass} />
              </AdminField>
              <AdminField label="Display order">
                <input type="number" disabled={!canEdit} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className={adminInputClass} />
              </AdminField>
            </div>
            <AdminField label="Image">
              <MediaPicker accessToken={accessToken} disabled={!canEdit} value={form.imageId ?? null} onChange={(id) => setForm({ ...form, imageId: id })} />
            </AdminField>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" disabled={!canEdit} checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
            <AdminFlash message={message} error={error} />
            {canEdit ? (
              <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                {saving ? "Saving…" : editingId ? "Update industry" : "Create industry"}
              </button>
            ) : null}
          </form>
        </AdminPanel>
      </div>
    </div>
  );
}
