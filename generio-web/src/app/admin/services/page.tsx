"use client";

import { FormEvent, useState } from "react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
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
  AdminService,
  UpsertServicePayload,
  createAdminService,
  deactivateAdminService,
  errorMessage,
  fetchAdminServices,
  toSlug,
  updateAdminService,
} from "@/lib/content-admin-api";
import { useAdminFetch } from "@/lib/use-admin-loader";

function emptyForm(): UpsertServicePayload {
  return {
    title: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    bulletPointsJson: "[]",
    icon: "",
    featuredImageId: null,
    displayOrder: 1,
    isFeatured: false,
    isActive: true,
    seoTitle: "",
    seoDescription: "",
  };
}

export default function AdminServicesPage() {
  const { accessToken, hasPermission } = useAuth();
  const canEdit = hasPermission("Services.Edit");
  const [items, setItems] = useState<AdminService[]>([]);
  const [form, setForm] = useState<UpsertServicePayload>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!accessToken) return;
    const data = await fetchAdminServices(accessToken);
    setItems(data);
  }

  useAdminFetch(
    Boolean(accessToken && hasPermission("Services.View")),
    () => fetchAdminServices(accessToken!),
    setItems,
    setError,
    "Unable to load services.",
    [accessToken, hasPermission],
  );

  function edit(item: AdminService) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      shortDescription: item.shortDescription,
      fullDescription: item.fullDescription,
      bulletPointsJson: item.bulletPointsJson ?? "[]",
      icon: item.icon ?? "",
      featuredImageId: item.featuredImageId,
      displayOrder: item.displayOrder,
      isFeatured: item.isFeatured,
      isActive: item.isActive,
      seoTitle: item.seoTitle ?? "",
      seoDescription: item.seoDescription ?? "",
    });
    setMessage(null);
    setError(null);
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
    const payload: UpsertServicePayload = {
      ...form,
      slug: form.slug?.trim() || toSlug(form.title),
      featuredImageId: form.featuredImageId || null,
    };
    try {
      if (editingId) {
        await updateAdminService(accessToken, editingId, payload);
        setMessage("Service updated.");
      } else {
        await createAdminService(accessToken, payload);
        setMessage("Service created.");
      }
      reset();
      await load();
    } catch (err) {
      setError(errorMessage(err, "Unable to save service."));
    } finally {
      setSaving(false);
    }
  }

  async function onDeactivate(id: string) {
    if (!accessToken || !canEdit) return;
    try {
      await deactivateAdminService(accessToken, id);
      setMessage("Service deactivated.");
      if (editingId === id) reset();
      await load();
    } catch (err) {
      setError(errorMessage(err, "Unable to deactivate service."));
    }
  }

  if (!hasPermission("Services.View")) return <AdminDenied resource="services" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        description="Manage Generio service catalogue content for the public site."
        actions={
          canEdit ? (
            <button type="button" onClick={reset} className={adminSecondaryButtonClass}>
              New service
            </button>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminTable
          headers={["Order", "Title", "Slug", "Status", ""]}
          empty={items.length ? undefined : "No services yet."}
        >
          {items.map((item) => (
            <tr key={item.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-2 text-[var(--ink-muted)]">{item.displayOrder}</td>
              <td className="px-4 py-2 font-medium text-[var(--ink)]">{item.title}</td>
              <td className="px-4 py-2 text-[var(--ink-muted)]">{item.slug}</td>
              <td className="px-4 py-2">
                <AdminStatusPill active={item.isActive} />
              </td>
              <td className="px-4 py-2 text-right">
                <button type="button" onClick={() => edit(item)} className="text-sm font-semibold text-[var(--brand-deep)] hover:underline">
                  Edit
                </button>
                {canEdit && item.isActive ? (
                  <button
                    type="button"
                    onClick={() => onDeactivate(item.id)}
                    className="ml-3 text-sm text-red-600 hover:underline"
                  >
                    Deactivate
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </AdminTable>

        <AdminPanel title={editingId ? "Edit service" : "Create service"}>
          <form onSubmit={onSubmit} className="space-y-4">
            <AdminField label="Title">
              <input
                required
                disabled={!canEdit}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={adminInputClass}
              />
            </AdminField>
            <AdminField label="Slug" hint="Leave blank to auto-generate from title.">
              <input
                disabled={!canEdit}
                value={form.slug ?? ""}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={adminInputClass}
              />
            </AdminField>
            <AdminField label="Short description">
              <textarea
                disabled={!canEdit}
                value={form.shortDescription ?? ""}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className={adminTextareaClass}
              />
            </AdminField>
            <AdminField label="Full description">
              <RichTextEditor
                disabled={!canEdit}
                value={form.fullDescription ?? ""}
                onChange={(html) => setForm({ ...form, fullDescription: html })}
              />
            </AdminField>
            <AdminField label="Bullet points JSON" hint='Example: ["Point one","Point two"]'>
              <textarea
                disabled={!canEdit}
                value={form.bulletPointsJson ?? "[]"}
                onChange={(e) => setForm({ ...form, bulletPointsJson: e.target.value })}
                className={adminTextareaClass}
              />
            </AdminField>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Icon key">
                <input
                  disabled={!canEdit}
                  value={form.icon ?? ""}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Display order">
                <input
                  type="number"
                  disabled={!canEdit}
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                  className={adminInputClass}
                />
              </AdminField>
            </div>
            <AdminField label="Featured image">
              <MediaPicker
                accessToken={accessToken}
                disabled={!canEdit}
                value={form.featuredImageId ?? null}
                onChange={(id) => setForm({ ...form, featuredImageId: id })}
              />
            </AdminField>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />
                Featured
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>
            <AdminField label="SEO title">
              <input
                disabled={!canEdit}
                value={form.seoTitle ?? ""}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                className={adminInputClass}
              />
            </AdminField>
            <AdminField label="SEO description">
              <textarea
                disabled={!canEdit}
                value={form.seoDescription ?? ""}
                onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                className={adminTextareaClass}
              />
            </AdminField>
            <AdminFlash message={message} error={error} />
            {canEdit ? (
              <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                {saving ? "Saving…" : editingId ? "Update service" : "Create service"}
              </button>
            ) : null}
          </form>
        </AdminPanel>
      </div>
    </div>
  );
}
