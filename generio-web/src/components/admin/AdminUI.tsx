import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1
          className="text-2xl font-semibold text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}
        >
          {title}
        </h1>
        {description ? <p className="mt-1 text-sm text-[var(--ink-muted)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminDenied({ resource }: { resource: string }) {
  return <p className="text-[var(--ink-muted)]">You do not have access to {resource}.</p>;
}

export function AdminStatusPill({
  active,
  labelActive = "Active",
  labelInactive = "Inactive",
}: {
  active: boolean;
  labelActive?: string;
  labelInactive?: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-[var(--surface-muted)] text-[var(--ink-muted)]"
      }`}
    >
      {active ? labelActive : labelInactive}
    </span>
  );
}

export function AdminField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-[var(--ink)]">{label}</span>
      {hint ? <span className="mb-1 block text-xs text-[var(--ink-muted)]">{hint}</span> : null}
      {children}
    </label>
  );
}

export const adminInputClass =
  "w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm outline-none ring-[var(--brand-primary)] focus:ring-2 disabled:bg-[var(--surface-muted)]";

export const adminTextareaClass = `${adminInputClass} min-h-[96px] resize-y`;

export const adminSelectClass = adminInputClass;

export const adminPrimaryButtonClass =
  "rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-primary-dark)] disabled:opacity-60";

export const adminSecondaryButtonClass =
  "rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] disabled:opacity-60";

export function AdminFlash({ message, error }: { message?: string | null; error?: string | null }) {
  return (
    <>
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </>
  );
}

export function AdminTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[var(--surface-muted)] text-[var(--ink-muted)]">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty ? (
        <p className="border-t border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--ink-muted)]">
          {empty}
        </p>
      ) : null}
    </div>
  );
}

export function AdminPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--ink)]">{title}</h2>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}
