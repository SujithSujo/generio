"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  AdminDenied,
  AdminField,
  AdminFlash,
  AdminPageHeader,
  AdminPanel,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/AdminUI";
import { useAuth } from "@/lib/auth-context";
import {
  AdminPageDetail,
  SECTION_TYPES,
  SectionPayload,
  errorMessage,
  fetchAdminPage,
  updateAdminPage,
  updateAdminPageSections,
} from "@/lib/content-admin-api";
import { useAdminFetch } from "@/lib/use-admin-loader";

function blankSection(order: number): SectionPayload {
  return {
    id: null,
    sectionType: "rich_text",
    title: "",
    subtitle: "",
    description: "",
    contentJson: "",
    backgroundImageId: null,
    displayOrder: order,
    isVisible: true,
  };
}

export default function AdminPageEditorPage() {
  const params = useParams<{ id: string }>();
  const pageId = params.id;
  const { accessToken, hasPermission } = useAuth();
  const canEdit = hasPermission("Pages.Edit");
  const [page, setPage] = useState<AdminPageDetail | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [pageType, setPageType] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [sections, setSections] = useState<SectionPayload[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function applyPage(detail: AdminPageDetail) {
    setPage(detail);
    setName(detail.name);
    setTitle(detail.title);
    setSlug(detail.slug);
    setPageType(detail.pageType ?? "");
    setIsPublished(detail.isPublished);
    setSections(
      detail.sections.map((section) => ({
        id: section.id,
        sectionType: section.sectionType,
        title: section.title ?? "",
        subtitle: section.subtitle ?? "",
        description: section.description ?? "",
        contentJson: section.contentJson ?? "",
        backgroundImageId: section.backgroundImageId,
        displayOrder: section.displayOrder,
        isVisible: section.isVisible,
      })),
    );
  }

  async function load() {
    if (!accessToken || !pageId) return;
    applyPage(await fetchAdminPage(accessToken, pageId));
  }

  useAdminFetch(
    Boolean(accessToken && hasPermission("Pages.View") && pageId),
    () => fetchAdminPage(accessToken!, pageId),
    applyPage,
    setError,
    "Unable to load page.",
    [accessToken, hasPermission, pageId],
  );

  async function saveMeta(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canEdit || !pageId) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateAdminPage(accessToken, pageId, {
        name,
        title,
        slug,
        pageType,
        isPublished,
      });
      setMessage(isPublished ? "Page published." : "Page saved as draft.");
      await load();
    } catch (err) {
      setError(errorMessage(err, "Unable to save page."));
    } finally {
      setSaving(false);
    }
  }

  async function saveSections() {
    if (!accessToken || !canEdit || !pageId) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateAdminPageSections(
        accessToken,
        pageId,
        sections.map((section, index) => ({
          ...section,
          displayOrder: section.displayOrder || index + 1,
          backgroundImageId: section.backgroundImageId || null,
        })),
      );
      setMessage(
        isPublished
          ? "Sections saved. Refresh the public page to see changes."
          : "Sections saved as draft. Publish the page before they appear publicly.",
      );
      await load();
    } catch (err) {
      setError(errorMessage(err, "Unable to save sections."));
    } finally {
      setSaving(false);
    }
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setSections(next.map((section, i) => ({ ...section, displayOrder: i + 1 })));
  }

  if (!hasPermission("Pages.View")) return <AdminDenied resource="pages" />;
  if (!page && !error) {
    return <p className="text-sm text-[var(--ink-muted)]">Loading page…</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={page?.name ?? "Page editor"}
        description="Edit page metadata, publishing, and ordered sections."
        actions={
          <Link href="/admin/pages" className={adminSecondaryButtonClass}>
            Back to pages
          </Link>
        }
      />

      <AdminFlash message={message} error={error} />

      <AdminPanel title="Page details & publishing">
        <form onSubmit={saveMeta} className="grid gap-4 md:grid-cols-2">
          <AdminField label="Internal name">
            <input required disabled={!canEdit} value={name} onChange={(e) => setName(e.target.value)} className={adminInputClass} />
          </AdminField>
          <AdminField label="Public title">
            <input required disabled={!canEdit} value={title} onChange={(e) => setTitle(e.target.value)} className={adminInputClass} />
          </AdminField>
          <AdminField label="Slug">
            <input required disabled={!canEdit} value={slug} onChange={(e) => setSlug(e.target.value)} className={adminInputClass} />
          </AdminField>
          <AdminField label="Page type">
            <input disabled={!canEdit} value={pageType} onChange={(e) => setPageType(e.target.value)} className={adminInputClass} />
          </AdminField>
          <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" disabled={!canEdit} checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            Published on the public site
          </label>
          {canEdit ? (
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                {saving ? "Saving…" : "Save page details"}
              </button>
            </div>
          ) : null}
        </form>
      </AdminPanel>

      <AdminPanel title="Section builder">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id ?? `section-${index}`} className="space-y-3 rounded-md border border-[var(--border)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--ink)]">
                  Section {index + 1}
                  <span className="ml-2 font-normal text-[var(--ink-muted)]">{section.sectionType}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={!canEdit} onClick={() => moveSection(index, -1)} className={adminSecondaryButtonClass}>
                    Up
                  </button>
                  <button type="button" disabled={!canEdit} onClick={() => moveSection(index, 1)} className={adminSecondaryButtonClass}>
                    Down
                  </button>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => setSections(sections.filter((_, i) => i !== index))}
                      className="rounded-md px-3 py-2 text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <AdminField label="Section type">
                  <select
                    disabled={!canEdit}
                    value={section.sectionType}
                    onChange={(e) => {
                      const next = [...sections];
                      next[index] = { ...section, sectionType: e.target.value };
                      setSections(next);
                    }}
                    className={adminSelectClass}
                  >
                    {SECTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                    {!SECTION_TYPES.includes(section.sectionType as (typeof SECTION_TYPES)[number]) ? (
                      <option value={section.sectionType}>{section.sectionType}</option>
                    ) : null}
                  </select>
                </AdminField>
                <AdminField label="Display order">
                  <input
                    type="number"
                    disabled={!canEdit}
                    value={section.displayOrder}
                    onChange={(e) => {
                      const next = [...sections];
                      next[index] = { ...section, displayOrder: Number(e.target.value) };
                      setSections(next);
                    }}
                    className={adminInputClass}
                  />
                </AdminField>
              </div>

              <AdminField label="Title">
                <input
                  disabled={!canEdit}
                  value={section.title ?? ""}
                  onChange={(e) => {
                    const next = [...sections];
                    next[index] = { ...section, title: e.target.value };
                    setSections(next);
                  }}
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Subtitle">
                <input
                  disabled={!canEdit}
                  value={section.subtitle ?? ""}
                  onChange={(e) => {
                    const next = [...sections];
                    next[index] = { ...section, subtitle: e.target.value };
                    setSections(next);
                  }}
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Description">
                {section.sectionType === "rich_text" ? (
                  <RichTextEditor
                    disabled={!canEdit}
                    value={section.description ?? ""}
                    onChange={(html) => {
                      const next = [...sections];
                      next[index] = { ...section, description: html };
                      setSections(next);
                    }}
                  />
                ) : (
                  <textarea
                    disabled={!canEdit}
                    value={section.description ?? ""}
                    onChange={(e) => {
                      const next = [...sections];
                      next[index] = { ...section, description: e.target.value };
                      setSections(next);
                    }}
                    className={adminTextareaClass}
                  />
                )}
              </AdminField>
              <AdminField label="Content JSON" hint="Optional structured payload for the section renderer.">
                <textarea
                  disabled={!canEdit}
                  value={section.contentJson ?? ""}
                  onChange={(e) => {
                    const next = [...sections];
                    next[index] = { ...section, contentJson: e.target.value };
                    setSections(next);
                  }}
                  className={adminTextareaClass}
                />
              </AdminField>
              <AdminField label="Background image">
                <MediaPicker
                  accessToken={accessToken}
                  disabled={!canEdit}
                  value={section.backgroundImageId ?? null}
                  onChange={(id) => {
                    const next = [...sections];
                    next[index] = { ...section, backgroundImageId: id };
                    setSections(next);
                  }}
                />
              </AdminField>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={section.isVisible}
                  onChange={(e) => {
                    const next = [...sections];
                    next[index] = { ...section, isVisible: e.target.checked };
                    setSections(next);
                  }}
                />
                Visible
              </label>
            </div>
          ))}

          {canEdit ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSections([...sections, blankSection(sections.length + 1)])}
                className={adminSecondaryButtonClass}
              >
                Add section
              </button>
              <button type="button" disabled={saving} onClick={saveSections} className={adminPrimaryButtonClass}>
                {saving ? "Saving…" : "Save sections"}
              </button>
              <p className="w-full text-xs text-[var(--ink-muted)]">
                Section Description, titles, and content only go live after <strong>Save sections</strong>
                {isPublished ? "" : " and publishing the page"}.
              </p>
            </div>
          ) : null}
        </div>
      </AdminPanel>
    </div>
  );
}
