"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchUsers } from "@/lib/auth-service";

export default function AdminUsersPage() {
  const { accessToken, hasPermission } = useAuth();
  const [users, setUsers] = useState<Awaited<ReturnType<typeof fetchUsers>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !hasPermission("Users.View")) return;
    fetchUsers(accessToken)
      .then(setUsers)
      .catch(() => setError("Unable to load users."));
  }, [accessToken, hasPermission]);

  if (!hasPermission("Users.View")) {
    return <p className="text-[var(--ink-muted)]">You do not have access to users.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
        >
          Users
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">CMS accounts and assigned roles.</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-[var(--ink-muted)]">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Roles</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Last login</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-2">{user.fullName}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.roles.join(", ")}</td>
                <td className="px-4 py-2">{user.isActive ? "Active" : "Disabled"}</td>
                <td className="px-4 py-2 text-[var(--ink-muted)]">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
