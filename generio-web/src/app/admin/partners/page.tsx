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
  AdminPartner,
  UpsertPartnerPayload,
  createAdminPartner,
  errorMessage,
  fetchAdminPartners,
  toSlug,
  updateAdminPartner,
} from "@/lib/content-admin-api";
import { useAdminFetch } from "@/lib/use-admin-loader";

function emptyForm(): UpsertPartnerPayload {
  return {
    name: "",
    slug: "",
    category: "",
    shortDescription: "",
    websiteUrl: "",
    logoMediaId: null,
    displayOrder: 1,
    isFeatured: false,
    isActive: true,
  };
}

export default function AdminPartnersPage() {
  const { accessToken, hasPermission } = useAuth();
  const canEdit = hasPermission("Partners.Edit");
  const [items, setItems] = useState<AdminPartner[]>([]);
  const [form, setForm] = useState<UpsertPartnerPayload>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!accessToken) return;
    setItems(await fetchAdminPartners(accessToken));
  }

  useAdminFetch(
    Boolean(accessToken && hasPermission("Partners.View")),
    () => fetchAdminPartners(accessToken!),
    setItems,
    setError,
    "Unable to load partners.",
    [accessToken, hasPermission],
  );

  function edit(item: AdminPartner) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      category: item.category ?? "",
      shortDescription: item.shortDescription ?? "",
      websiteUrl: item.websiteUrl ?? "",
      logoMediaId: item.logoMediaId,
      displayOrder: item.displayOrder,
      isFeatured: item.isFeatured,
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
      logoMediaId: form.logoMediaId || null,
    };
    try {
      if (editingId) await updateAdminPartner(accessToken, editingId, payload);
      else await createAdminPartner(accessToken, payload);
      setMessage(editingId ? "Partner updated." : "Partner created.");
      reset();
      await load();
    } catch (err) {
      setError(errorMessage(err, "Unable to save partner."));
    } finally {
      setSaving(false);
    }
  }

  if (!hasPermission("Partners.View")) return <AdminDenied resource="partners" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Partners"
        description="Partner network entries. Logos can be linked once media assets exist."
        actions={
          canEdit ? (
            <button type="button" onClick={reset} className={adminSecondaryButtonClass}>
              New partner
            </button>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminTable headers={["Order", "Name", "Category", "Status", ""]} empty={items.length ? undefined : "No partners yet — add when assets are ready."}>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-2 text-[var(--ink-muted)]">{item.displayOrder}</td>
              <td className="px-4 py-2 font-medium">{item.name}</td>
              <td className="px-4 py-2 text-[var(--ink-muted)]">{item.category ?? "—"}</td>
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

        <AdminPanel title={editingId ? "Edit partner" : "Create partner"}>
          <form onSubmit={onSubmit} className="space-y-4">
            <AdminField label="Name">
              <input required disabled={!canEdit} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Slug">
              <input disabled={!canEdit} value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Category">
              <input disabled={!canEdit} value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Short description">
              <textarea disabled={!canEdit} value={form.shortDescription ?? ""} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className={adminTextareaClass} />
            </AdminField>
            <AdminField label="Website URL">
              <input disabled={!canEdit} value={form.websiteUrl ?? ""} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Logo">
              <MediaPicker accessToken={accessToken} disabled={!canEdit} value={form.logoMediaId ?? null} onChange={(id) => setForm({ ...form, logoMediaId: id })} />
            </AdminField>
            <AdminField label="Display order">
              <input type="number" disabled={!canEdit} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className={adminInputClass} />
            </AdminField>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" disabled={!canEdit} checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                Featured
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" disabled={!canEdit} checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            <AdminFlash message={message} error={error} />
            {canEdit ? (
              <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                {saving ? "Saving…" : editingId ? "Update partner" : "Create partner"}
              </button>
            ) : null}
          </form>
        </AdminPanel>
      </div>
    </div>
  );
}
