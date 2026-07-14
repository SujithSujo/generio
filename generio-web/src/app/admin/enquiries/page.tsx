"use client";

import { FormEvent, useState } from "react";
import {
  AdminDenied,
  AdminField,
  AdminFlash,
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/AdminUI";
import { useAuth } from "@/lib/auth-context";
import { fetchUsers } from "@/lib/auth-service";
import { API_BASE_URL } from "@/lib/api-client";
import {
  AdminEnquiry,
  errorMessage,
  fetchAdminEnquiries,
  updateAdminEnquiry,
} from "@/lib/content-admin-api";
import { useAdminFetch } from "@/lib/use-admin-loader";

const STATUSES = ["New", "Contacted", "InProgress", "Qualified", "Closed", "Spam"];
const TYPES = ["BrandOwner", "Distributor", "General", "Other"];

export default function AdminEnquiriesPage() {
  const { accessToken, hasPermission } = useAuth();
  const canEdit = hasPermission("Enquiries.Edit");
  const [items, setItems] = useState<AdminEnquiry[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; fullName: string; email: string }>>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selected, setSelected] = useState<AdminEnquiry | null>(null);
  const [status, setStatus] = useState("New");
  const [remarks, setRemarks] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function reload() {
    if (!accessToken) return;
    const data = await fetchAdminEnquiries(accessToken, {
      status: statusFilter || undefined,
      enquiryType: typeFilter || undefined,
    });
    setItems(data);
    if (selected) {
      const refreshed = data.find((item) => item.id === selected.id) ?? null;
      setSelected(refreshed);
      if (refreshed) {
        setStatus(refreshed.status);
        setRemarks(refreshed.internalRemarks ?? "");
        setAssignedTo(refreshed.assignedToUserId ?? "");
      }
    }
  }

  useAdminFetch(
    Boolean(accessToken && hasPermission("Enquiries.View")),
    async () => {
      const [enquiries, userList] = await Promise.all([
        fetchAdminEnquiries(accessToken!, {
          status: statusFilter || undefined,
          enquiryType: typeFilter || undefined,
        }),
        hasPermission("Users.View") ? fetchUsers(accessToken!) : Promise.resolve([]),
      ]);
      return { enquiries, userList };
    },
    ({ enquiries, userList }) => {
      setItems(enquiries);
      setUsers(userList.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email })));
    },
    setError,
    "Unable to load enquiries.",
    [accessToken, hasPermission, statusFilter, typeFilter],
  );

  function openEnquiry(item: AdminEnquiry) {
    setSelected(item);
    setStatus(item.status);
    setRemarks(item.internalRemarks ?? "");
    setAssignedTo(item.assignedToUserId ?? "");
    setMessage(null);
    setError(null);
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canEdit || !selected) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateAdminEnquiry(accessToken, selected.id, {
        status,
        internalRemarks: remarks,
        assignedToUserId: assignedTo || null,
      });
      setSelected(updated);
      setMessage("Enquiry updated.");
      await reload();
    } catch (err) {
      setError(errorMessage(err, "Unable to update enquiry."));
    } finally {
      setSaving(false);
    }
  }

  async function onExport() {
    if (!accessToken || !canEdit) return;
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("enquiryType", typeFilter);
    const query = params.toString();
    const response = await fetch(
      `${API_BASE_URL}/api/admin/enquiries/export${query ? `?${query}` : ""}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) {
      setError("Unable to export enquiries.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `generio-enquiries-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!hasPermission("Enquiries.View")) return <AdminDenied resource="enquiries" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Enquiries"
        description="Single-form inbox for brand owners, distributors, and general contacts."
        actions={
          canEdit ? (
            <button type="button" onClick={onExport} className={adminSecondaryButtonClass}>
              Export CSV
            </button>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={adminSelectClass + " max-w-xs"}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={adminSelectClass + " max-w-xs"}>
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminTable
          headers={["When", "Name", "Type", "Subject", "Status", ""]}
          empty={items.length ? undefined : "No enquiries match these filters."}
        >
          {items.map((item) => (
            <tr key={item.id} className="border-t border-[var(--border)]">
              <td className="px-4 py-2 text-[var(--ink-muted)] whitespace-nowrap">
                {new Date(item.submittedAt).toLocaleString()}
              </td>
              <td className="px-4 py-2">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-[var(--ink-muted)]">{item.email}</p>
              </td>
              <td className="px-4 py-2 text-[var(--ink-muted)]">{item.enquiryType}</td>
              <td className="px-4 py-2">{item.subject}</td>
              <td className="px-4 py-2 text-[var(--ink-muted)]">{item.status}</td>
              <td className="px-4 py-2 text-right">
                <button type="button" onClick={() => openEnquiry(item)} className="text-sm font-semibold text-[var(--brand-deep)] hover:underline">
                  Open
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>

        <AdminPanel title={selected ? selected.subject : "Enquiry detail"}>
          {!selected ? (
            <p className="text-sm text-[var(--ink-muted)]">Select an enquiry to review and update.</p>
          ) : (
            <form onSubmit={onSave} className="space-y-4">
              <div className="space-y-1 text-sm text-[var(--ink-muted)]">
                <p>
                  <strong className="text-[var(--ink)]">{selected.name}</strong> · {selected.email}
                </p>
                <p>
                  {selected.phone ?? "No phone"} · {selected.company ?? "No company"}
                </p>
                <p>
                  Type: {selected.enquiryType} · IP: {selected.ipAddress ?? "—"}
                </p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm leading-relaxed text-[var(--ink)] whitespace-pre-wrap">
                {selected.message}
              </div>
              <AdminField label="Status">
                <select disabled={!canEdit} value={status} onChange={(e) => setStatus(e.target.value)} className={adminSelectClass}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Assign to">
                <select disabled={!canEdit} value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={adminSelectClass}>
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Internal remarks">
                <textarea disabled={!canEdit} value={remarks} onChange={(e) => setRemarks(e.target.value)} className={adminTextareaClass} />
              </AdminField>
              <AdminFlash message={message} error={error} />
              {canEdit ? (
                <button type="submit" disabled={saving} className={adminPrimaryButtonClass}>
                  {saving ? "Saving…" : "Save enquiry"}
                </button>
              ) : null}
            </form>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
