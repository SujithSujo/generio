"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminUI";
import { useAuth } from "@/lib/auth-context";
import { fetchSettings, updateSettings } from "@/lib/auth-service";

type SettingRow = {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
};

export default function AdminSettingsPage() {
  const { accessToken, hasPermission } = useAuth();
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const canEdit = hasPermission("Settings.Edit");

  useEffect(() => {
    if (!accessToken || !hasPermission("Settings.View")) return;
    fetchSettings(accessToken)
      .then(setRows)
      .catch(() => setError("Unable to load settings."));
  }, [accessToken, hasPermission]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canEdit) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateSettings(
        accessToken,
        rows.map((row) => ({ key: row.key, value: row.value })),
      );
      setMessage("Settings saved.");
    } catch {
      setError("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!hasPermission("Settings.View")) {
    return <p className="text-[var(--ink-muted)]">You do not have access to settings.</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site settings"
        description="Company contact, footer CTAs, and site-wide CMS values (menus stay in code for MVP; CTA/footer copy lives here)."
      />

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-5">
        {rows.map((row, index) => (
          <label key={row.id} className="block text-sm">
            <span className="mb-1 block font-medium text-[var(--ink)]">{row.key}</span>
            {row.description ? (
              <span className="mb-1 block text-xs text-[var(--ink-muted)]">{row.description}</span>
            ) : null}
            <input
              value={row.value}
              disabled={!canEdit}
              onChange={(e) => {
                const next = [...rows];
                next[index] = { ...row, value: e.target.value };
                setRows(next);
              }}
              className="w-full rounded-md border border-[var(--border)] px-3 py-2 outline-none ring-[var(--brand-primary)] focus:ring-2 disabled:bg-[var(--surface-muted)]"
            />
          </label>
        ))}

        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {canEdit ? (
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-primary-dark)] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        ) : null}
      </form>
    </div>
  );
}
