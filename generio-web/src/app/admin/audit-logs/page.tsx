"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchAuditLogs } from "@/lib/auth-service";

export default function AdminAuditLogsPage() {
  const { accessToken, hasPermission } = useAuth();
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof fetchAuditLogs>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !hasPermission("Audit.View")) return;
    fetchAuditLogs(accessToken)
      .then(setLogs)
      .catch(() => setError("Unable to load audit logs."));
  }, [accessToken, hasPermission]);

  if (!hasPermission("Audit.View")) {
    return <p className="text-[var(--ink-muted)]">You do not have access to audit logs.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
        >
          Audit logs
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">Recent authenticated CMS actions.</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-2 font-medium">When</th>
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Action</th>
              <th className="px-4 py-2 font-medium">Entity</th>
              <th className="px-4 py-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-[var(--border)] align-top">
                <td className="px-4 py-2 whitespace-nowrap text-[var(--ink-muted)]">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2">{log.userEmail ?? "—"}</td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">
                  {log.entityType}
                  {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="px-4 py-2 text-[var(--ink-muted)]">{log.details ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
