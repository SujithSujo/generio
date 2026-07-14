"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchRoles } from "@/lib/auth-service";

export default function AdminRolesPage() {
  const { accessToken, hasPermission } = useAuth();
  const [roles, setRoles] = useState<Awaited<ReturnType<typeof fetchRoles>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !hasPermission("Roles.View")) return;
    fetchRoles(accessToken)
      .then(setRoles)
      .catch(() => setError("Unable to load roles."));
  }, [accessToken, hasPermission]);

  if (!hasPermission("Roles.View")) {
    return <p className="text-[var(--ink-muted)]">You do not have access to roles.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-semibold text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
        >
          Roles & permissions
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">Role catalogue seeded for Generio CMS access.</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="space-y-4">
        {roles.map((role) => (
          <article key={role.id} className="rounded-lg border border-[var(--border)] bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold text-[var(--ink)]">{role.name}</h2>
              <span className="text-xs text-[var(--ink-muted)]">{role.userCount} users</span>
            </div>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">{role.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {role.permissions.map((permission) => (
                <span
                  key={permission}
                  className="rounded bg-[var(--brand-primary-light)] px-2 py-1 text-xs text-[var(--brand-primary-dark)]"
                >
                  {permission}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
