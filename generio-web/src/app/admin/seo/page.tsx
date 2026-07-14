"use client";

import { FormEvent, useMemo, useState } from "react";
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
  AdminPageListItem,
  AdminRedirect,
  AdminSeo,
  UpsertRedirectPayload,
  UpsertSeoPayload,
  createAdminRedirect,
  deleteAdminRedirect,
  errorMessage,
  fetchAdminPages,
  fetchAdminRedirects,
  fetchAdminSeo,
  updateAdminRedirect,
  upsertAdminSeo,
} from "@/lib/content-admin-api";
import { useAdminFetch } from "@/lib/use-admin-loader";

function emptySeo(page: AdminPageListItem | null): UpsertSeoPayload {
  return {
    entityType: "Page",
    entityId: page?.id ?? "",
    languageCode: "en",
    seoTitle: page?.title ?? "",
    metaDescription: "",
    canonicalUrl: "",
    openGraphTitle: "",
    openGraphDescription: "",
    openGraphImageId: null,
    robotsIndex: true,
    robotsFollow: true,
    structuredDataJson: "",
  };
}

export default function AdminSeoPage() {
  const { accessToken, hasPermission } = useAuth();
  const canEdit = hasPermission("Seo.Edit");
  const [pages, setPages] = useState<AdminPageListItem[]>([]);
  const [seoRows, setSeoRows] = useState<AdminSeo[]>([]);
  const [redirects, setRedirects] = useState<AdminRedirect[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [form, setForm] = useState<UpsertSeoPayload>(emptySeo(null));
  const [redirectForm, setRedirectForm] = useState<UpsertRedirectPayload>({
    fromPath: "",
    toUrl: "",
    isPermanent: true,
    isActive: true,
  });
  const [editingRedirectId, setEditingRedirectId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useAdminFetch(
    Boolean(accessToken && hasPermission("Seo.View")),
    async () => {
      const [pageList, seoList, redirectList] = await Promise.all([
        fetchAdminPages(accessToken!),
        fetchAdminSeo(accessToken!, "Page"),
        fetchAdminRedirects(accessToken!),
      ]);
      return { pageList, seoList, redirectList };
    },
    ({ pageList, seoList, redirectList }) => {
      setPages(pageList);
      setSeoRows(seoList);
      setRedirects(redirectList);
      const first = pageList[0];
      if (first) {
        setSelectedPageId(first.id);
        const existing = seoList.find((s) => s.entityId === first.id);
        setForm(
          existing
            ? {
                entityType: "Page",
                entityId: first.id,
                languageCode: existing.languageCode,
                seoTitle: existing.seoTitle ?? "",
                metaDescription: existing.metaDescription ?? "",
                canonicalUrl: existing.canonicalUrl ?? "",
                openGraphTitle: existing.openGraphTitle ?? "",
                openGraphDescription: existing.openGraphDescription ?? "",
                openGraphImageId: existing.openGraphImageId,
                robotsIndex: existing.robotsIndex,
                robotsFollow: existing.robotsFollow,
                structuredDataJson: existing.structuredDataJson ?? "",
              }
            : emptySeo(first),
        );
      }
    },
    setError,
    "Unable to load SEO data.",
    [accessToken, hasPermission],
  );

  const selectedPage = useMemo(
    () => pages.find((p) => p.id === selectedPageId) ?? null,
    [pages, selectedPageId],
  );

  function selectPage(pageId: string) {
    setSelectedPageId(pageId);
    const page = pages.find((p) => p.id === pageId) ?? null;
    const existing = seoRows.find((s) => s.entityId === pageId);
    setForm(
      existing
        ? {
            entityType: "Page",
            entityId: pageId,
            languageCode: existing.languageCode,
            seoTitle: existing.seoTitle ?? "",
            metaDescription: existing.metaDescription ?? "",
            canonicalUrl: existing.canonicalUrl ?? "",
            openGraphTitle: existing.openGraphTitle ?? "",
            openGraphDescription: existing.openGraphDescription ?? "",
            openGraphImageId: existing.openGraphImageId,
            robotsIndex: existing.robotsIndex,
            robotsFollow: existing.robotsFollow,
            structuredDataJson: existing.structuredDataJson ?? "",
          }
        : emptySeo(page),
    );
  }

  async function saveSeo(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canEdit || !form.entityId) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const saved = await upsertAdminSeo(accessToken, {
        ...form,
        openGraphImageId: form.openGraphImageId || null,
      });
      setSeoRows((prev) => {
        const others = prev.filter((s) => !(s.entityType === saved.entityType && s.entityId === saved.entityId));
        return [...others, saved];
      });
      setMessage("SEO saved.");
    } catch (err) {
      setError(errorMessage(err, "Unable to save SEO."));
    } finally {
      setSaving(false);
    }
  }

  async function saveRedirect(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canEdit) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      if (editingRedirectId) {
        await updateAdminRedirect(accessToken, editingRedirectId, redirectForm);
      } else {
        await createAdminRedirect(accessToken, redirectForm);
      }
      setRedirects(await fetchAdminRedirects(accessToken));
      setEditingRedirectId(null);
      setRedirectForm({ fromPath: "", toUrl: "", isPermanent: true, isActive: true });
      setMessage("Redirect saved.");
    } catch (err) {
      setError(errorMessage(err, "Unable to save redirect."));
    } finally {
      setSaving(false);
    }
  }

  async function removeRedirect(id: string) {
    if (!accessToken || !canEdit) return;
    try {
      await deleteAdminRedirect(accessToken, id);
      setRedirects(await fetchAdminRedirects(accessToken));
      setMessage("Redirect deleted.");
    } catch (err) {
      setError(errorMessage(err, "Unable to delete redirect."));
    }
  }

  if (!hasPermission("Seo.View")) return <AdminDenied resource="SEO" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SEO & redirects"
        description="Page SEO metadata, Open Graph, robots flags, and 301/302 redirects."
      />
      <AdminFlash message={message} error={error} />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminTable headers={["Page", "Slug", "SEO", ""]} empty={pages.length ? undefined : "No pages found."}>
          {pages.map((page) => {
            const hasSeo = seoRows.some((s) => s.entityId === page.id);
            return (
              <tr key={page.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-2 font-medium">{page.name}</td>
                <td className="px-4 py-2 text-[var(--ink-muted)]">{page.slug}</td>
                <td className="px-4 py-2">
                  <AdminStatusPill active={hasSeo} labelActive="Configured" labelInactive="Missing" />
                </td>
                <td className="px-4 py-2 text-right">
                  <button type="button" onClick={() => selectPage(page.id)} className="text-sm font-semibold text-[var(--brand-deep)] hover:underline">
                    Edit SEO
                  </button>
                </td>
              </tr>
            );
          })}
        </AdminTable>

        <AdminPanel title={selectedPage ? `SEO · ${selectedPage.name}` : "SEO editor"}>
          {!selectedPage ? (
            <p className="text-sm text-[var(--ink-muted)]">Select a page to edit SEO.</p>
          ) : (
            <form onSubmit={saveSeo} className="space-y-4">
              <AdminField label="SEO title">
                <input disabled={!canEdit} value={form.seoTitle ?? ""} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className={adminInputClass} />
              </AdminField>
              <AdminField label="Meta description">
                <textarea disabled={!canEdit} value={form.metaDescription ?? ""} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className={adminTextareaClass} />
              </AdminField>
              <AdminField label="Canonical URL">
                <input disabled={!canEdit} value={form.canonicalUrl ?? ""} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} className={adminInputClass} />
              </AdminField>
              <AdminField label="Open Graph title">
                <input disabled={!canEdit} value={form.openGraphTitle ?? ""} onChange={(e) => setForm({ ...form, openGraphTitle: e.target.value })} className={adminInputClass} />
              </AdminField>
              <AdminField label="Open Graph description">
                <textarea disabled={!canEdit} value={form.openGraphDescription ?? ""} onChange={(e) => setForm({ ...form, openGraphDescription: e.target.value })} className={adminTextareaClass} />
              </AdminField>
              <AdminField label="Open Graph image">
                <MediaPicker
                  accessToken={accessToken}
                  disabled={!canEdit}
                  value={form.openGraphImageId ?? null}
                  onChange={(id) => setForm({ ...form, openGraphImageId: id })}
                />
              </AdminField>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" disabled={!canEdit} checked={form.robotsIndex} onChange={(e) => setForm({ ...form, robotsIndex: e.target.checked })} />
                  Index
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" disabled={!canEdit} checked={form.robotsFollow} onChange={(e) => setForm({ ...form, robotsFollow: e.target.checked })} />
                  Follow
                </label>
              </div>
              <AdminField label="Structured data JSON-LD" hint="Optional raw JSON for Organization/WebPage schema.">
                <textarea disabled={!canEdit} value={form.structuredDataJson ?? ""} onChange={(e) => setForm({ ...form, structuredDataJson: e.target.value })} className={adminTextareaClass} />
              </AdminField>
              {canEdit ? (
                <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                  {saving ? "Saving…" : "Save SEO"}
                </button>
              ) : null}
            </form>
          )}
        </AdminPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminTable headers={["From", "To", "Type", "Status", ""]} empty={redirects.length ? undefined : "No redirects configured."}>
          {redirects.map((rule) => (
            <tr key={rule.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-2 font-medium">{rule.fromPath}</td>
              <td className="px-4 py-2 text-[var(--ink-muted)]">{rule.toUrl}</td>
              <td className="px-4 py-2 text-[var(--ink-muted)]">{rule.isPermanent ? "301" : "302"}</td>
              <td className="px-4 py-2">
                <AdminStatusPill active={rule.isActive} />
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRedirectId(rule.id);
                    setRedirectForm({
                      fromPath: rule.fromPath,
                      toUrl: rule.toUrl,
                      isPermanent: rule.isPermanent,
                      isActive: rule.isActive,
                    });
                  }}
                  className="text-sm font-semibold text-[var(--brand-deep)] hover:underline"
                >
                  Edit
                </button>
                {canEdit ? (
                  <button type="button" onClick={() => removeRedirect(rule.id)} className="ml-3 text-sm text-red-600 hover:underline">
                    Delete
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </AdminTable>

        <AdminPanel title={editingRedirectId ? "Edit redirect" : "Add redirect"}>
          <form onSubmit={saveRedirect} className="space-y-4">
            <AdminField label="From path" hint="Example: /old-markets">
              <input required disabled={!canEdit} value={redirectForm.fromPath} onChange={(e) => setRedirectForm({ ...redirectForm, fromPath: e.target.value })} className={adminInputClass} />
            </AdminField>
            <AdminField label="To URL or path" hint="Example: /markets or https://…">
              <input required disabled={!canEdit} value={redirectForm.toUrl} onChange={(e) => setRedirectForm({ ...redirectForm, toUrl: e.target.value })} className={adminInputClass} />
            </AdminField>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" disabled={!canEdit} checked={redirectForm.isPermanent} onChange={(e) => setRedirectForm({ ...redirectForm, isPermanent: e.target.checked })} />
                Permanent (301)
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" disabled={!canEdit} checked={redirectForm.isActive} onChange={(e) => setRedirectForm({ ...redirectForm, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            {canEdit ? (
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                  {saving ? "Saving…" : editingRedirectId ? "Update redirect" : "Create redirect"}
                </button>
                {editingRedirectId ? (
                  <button
                    type="button"
                    className={adminSecondaryButtonClass}
                    onClick={() => {
                      setEditingRedirectId(null);
                      setRedirectForm({ fromPath: "", toUrl: "", isPermanent: true, isActive: true });
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            ) : null}
          </form>
        </AdminPanel>
      </div>
    </div>
  );
}
