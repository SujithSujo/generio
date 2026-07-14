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
} from "@/components/admin/AdminUI";
import { useAuth } from "@/lib/auth-context";
import {
  AdminStory,
  UpsertStoryPayload,
  createAdminStory,
  errorMessage,
  fetchAdminStories,
  updateAdminStory,
} from "@/lib/content-admin-api";
import { useAdminFetch } from "@/lib/use-admin-loader";

function emptyForm(): UpsertStoryPayload {
  return {
    personName: "",
    designation: "",
    companyName: "",
    storyText: "",
    personImageId: null,
    companyLogoId: null,
    rating: 5,
    displayOrder: 1,
    isActive: true,
    isPublished: false,
  };
}

export default function AdminStoriesPage() {
  const { accessToken, hasPermission } = useAuth();
  const canEdit = hasPermission("Stories.Edit");
  const [items, setItems] = useState<AdminStory[]>([]);
  const [form, setForm] = useState<UpsertStoryPayload>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!accessToken) return;
    setItems(await fetchAdminStories(accessToken));
  }

  useAdminFetch(
    Boolean(accessToken && hasPermission("Stories.View")),
    () => fetchAdminStories(accessToken!),
    setItems,
    setError,
    "Unable to load success stories.",
    [accessToken, hasPermission],
  );

  function edit(item: AdminStory) {
    setEditingId(item.id);
    setForm({
      personName: item.personName ?? "",
      designation: item.designation ?? "",
      companyName: item.companyName ?? "",
      storyText: item.storyText,
      personImageId: item.personImageId,
      companyLogoId: item.companyLogoId,
      rating: item.rating,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
      isPublished: item.isPublished,
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
    try {
      if (editingId) await updateAdminStory(accessToken, editingId, form);
      else await createAdminStory(accessToken, form);
      setMessage(editingId ? "Story updated." : "Story created.");
      reset();
      await load();
    } catch (err) {
      setError(errorMessage(err, "Unable to save story."));
    } finally {
      setSaving(false);
    }
  }

  if (!hasPermission("Stories.View")) return <AdminDenied resource="success stories" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Success stories"
        description="Testimonials and case highlights. Publish only when ready for the public site."
        actions={
          canEdit ? (
            <button type="button" onClick={reset} className={adminSecondaryButtonClass}>
              New story
            </button>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminTable
          headers={["Order", "Person", "Company", "Published", ""]}
          empty={items.length ? undefined : "No success stories yet."}
        >
          {items.map((item) => (
            <tr key={item.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-2 text-[var(--ink-muted)]">{item.displayOrder}</td>
              <td className="px-4 py-2 font-medium">{item.personName ?? "—"}</td>
              <td className="px-4 py-2 text-[var(--ink-muted)]">{item.companyName ?? "—"}</td>
              <td className="px-4 py-2">
                <AdminStatusPill
                  active={item.isPublished}
                  labelActive="Published"
                  labelInactive="Draft"
                />
              </td>
              <td className="px-4 py-2 text-right">
                <button type="button" onClick={() => edit(item)} className="text-sm font-semibold text-[var(--brand-deep)] hover:underline">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>

        <AdminPanel title={editingId ? "Edit story" : "Create story"}>
          <form onSubmit={onSubmit} className="space-y-4">
            <AdminField label="Person name">
              <input disabled={!canEdit} value={form.personName ?? ""} onChange={(e) => setForm({ ...form, personName: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Designation">
              <input disabled={!canEdit} value={form.designation ?? ""} onChange={(e) => setForm({ ...form, designation: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Company">
              <input disabled={!canEdit} value={form.companyName ?? ""} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="Story">
              <RichTextEditor disabled={!canEdit} value={form.storyText} onChange={(html) => setForm({ ...form, storyText: html })} />
            </AdminField>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Rating (1–5)">
                <input
                  type="number"
                  min={1}
                  max={5}
                  disabled={!canEdit}
                  value={form.rating ?? 5}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Display order">
                <input type="number" disabled={!canEdit} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className={adminInputClass} />
              </AdminField>
            </div>
            <AdminField label="Person image">
              <MediaPicker accessToken={accessToken} disabled={!canEdit} value={form.personImageId ?? null} onChange={(id) => setForm({ ...form, personImageId: id })} />
            </AdminField>
            <AdminField label="Company logo">
              <MediaPicker accessToken={accessToken} disabled={!canEdit} value={form.companyLogoId ?? null} onChange={(id) => setForm({ ...form, companyLogoId: id })} />
            </AdminField>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" disabled={!canEdit} checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" disabled={!canEdit} checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                Published
              </label>
            </div>
            <AdminFlash message={message} error={error} />
            {canEdit ? (
              <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                {saving ? "Saving…" : editingId ? "Update story" : "Create story"}
              </button>
            ) : null}
          </form>
        </AdminPanel>
      </div>
    </div>
  );
}
