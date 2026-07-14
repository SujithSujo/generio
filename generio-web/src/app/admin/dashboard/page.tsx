"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchDashboard } from "@/lib/auth-service";

export default function AdminDashboardPage() {
  const { accessToken, hasPermission } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchDashboard>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !hasPermission("Dashboard.View")) return;
    fetchDashboard(accessToken)
      .then(setData)
      .catch(() => setError("Unable to load dashboard."));
  }, [accessToken, hasPermission]);

  if (!hasPermission("Dashboard.View")) {
    return <p className="text-[var(--ink-muted)]">You do not have access to the dashboard.</p>;
  }

  const contentCards = [
    ["Pages", data?.pages, "/admin/pages"],
    ["Services", data?.services, "/admin/services"],
    ["Industries", data?.industries, "/admin/industries"],
    ["Market regions", data?.marketRegions, "/admin/markets"],
    ["Partners", data?.partners, "/admin/partners"],
    ["Published stories", data?.successStories, "/admin/success-stories"],
    ["Enquiries", data?.enquiries, "/admin/enquiries"],
    ["New enquiries", data?.newEnquiries, "/admin/enquiries"],
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">Content inventory and recent CMS activity.</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contentCards.map(([label, value, href]) => (
          <Link
            key={label}
            href={href}
            className="rounded-lg border border-[var(--border)] bg-white p-4 transition hover:border-[var(--brand-primary)]"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{value ?? "—"}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Users", data?.users],
          ["Roles", data?.roles],
          ["Permissions", data?.permissions],
          ["Settings", data?.settings],
          ["Audit logs", data?.auditLogs],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-[var(--border)] bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">{value ?? "—"}</p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-white">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Recent audit activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-[var(--ink-muted)]">
              <tr>
                <th className="px-4 py-2 font-medium">When</th>
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Action</th>
                <th className="px-4 py-2 font-medium">Entity</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentAudit ?? []).map((row) => (
                <tr key={row.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-2 text-[var(--ink-muted)]">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{row.userEmail ?? "—"}</td>
                  <td className="px-4 py-2">{row.action}</td>
                  <td className="px-4 py-2">{row.entityType}</td>
                </tr>
              ))}
              {!data?.recentAudit?.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[var(--ink-muted)]">
                    No audit entries yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
