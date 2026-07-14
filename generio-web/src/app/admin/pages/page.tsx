"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "@/components/admin/AdminUI";
import { useAuth } from "@/lib/auth-context";
import {
  AdminPageListItem,
  createAdminPage,
  errorMessage,
  fetchAdminPages,
  toSlug,
} from "@/lib/content-admin-api";
import { useAdminFetch } from "@/lib/use-admin-loader";

export default function AdminPagesListPage() {
  const { accessToken, hasPermission } = useAuth();
  const canEdit = hasPermission("Pages.Edit");
  const router = useRouter();
  const [items, setItems] = useState<AdminPageListItem[]>([]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [pageType, setPageType] = useState("marketing");
  const [isPublished, setIsPublished] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useAdminFetch(
    Boolean(accessToken && hasPermission("Pages.View")),
    () => fetchAdminPages(accessToken!),
    setItems,
    setError,
    "Unable to load pages.",
    [accessToken, hasPermission],
  );

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canEdit) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const created = await createAdminPage(accessToken, {
        name,
        title: title || name,
        slug: slug.trim() || toSlug(name),
        pageType,
        isPublished,
      });
      setMessage("Page created.");
      router.push(`/admin/pages/${created.id}`);
    } catch (err) {
      setError(errorMessage(err, "Unable to create page."));
      setSaving(false);
    }
  }

  if (!hasPermission("Pages.View")) return <AdminDenied resource="pages" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pages"
        description="CMS pages, publish state, and section composition."
      />

      <AdminTable
        headers={["Name", "Slug", "Sections", "Status", "Updated", ""]}
        empty={items.length ? undefined : "No pages yet."}
      >
        {items.map((item) => (
          <tr key={item.id} className="border-t border-[var(--border)]">
            <td className="px-4 py-2 font-medium">{item.name}</td>
            <td className="px-4 py-2 text-[var(--ink-muted)]">{item.slug}</td>
            <td className="px-4 py-2 text-[var(--ink-muted)]">{item.sectionCount}</td>
            <td className="px-4 py-2">
              <AdminStatusPill
                active={item.isPublished}
                labelActive="Published"
                labelInactive={item.status || "Draft"}
              />
            </td>
            <td className="px-4 py-2 text-[var(--ink-muted)]">
              {new Date(item.updatedAt).toLocaleString()}
            </td>
            <td className="px-4 py-2 text-right">
              <Link href={`/admin/pages/${item.id}`} className="text-sm font-semibold text-[var(--brand-deep)] hover:underline">
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>

      {canEdit ? (
        <AdminPanel title="Create page">
          <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-2">
            <AdminField label="Internal name">
              <input required value={name} onChange={(e) => setName(e.target.value)} className={adminInputClass} />
            </AdminField>
            <AdminField label="Public title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={adminInputClass} />
            </AdminField>
            <AdminField label="Slug">
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={adminInputClass} />
            </AdminField>
            <AdminField label="Page type">
              <input value={pageType} onChange={(e) => setPageType(e.target.value)} className={adminInputClass} />
            </AdminField>
            <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              Publish immediately
            </label>
            <div className="md:col-span-2">
              <AdminFlash message={message} error={error} />
              <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                {saving ? "Creating…" : "Create page"}
              </button>
            </div>
          </form>
        </AdminPanel>
      ) : null}
    </div>
  );
}
