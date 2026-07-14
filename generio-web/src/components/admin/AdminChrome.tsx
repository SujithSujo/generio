"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", permission: "Dashboard.View" },
  { href: "/admin/pages", label: "Pages", permission: "Pages.View" },
  { href: "/admin/services", label: "Services", permission: "Services.View" },
  { href: "/admin/industries", label: "Industries", permission: "Industries.View" },
  { href: "/admin/markets", label: "Markets", permission: "Markets.View" },
  { href: "/admin/partners", label: "Partners", permission: "Partners.View" },
  { href: "/admin/success-stories", label: "Success stories", permission: "Stories.View" },
  { href: "/admin/enquiries", label: "Enquiries", permission: "Enquiries.View" },
  { href: "/admin/media", label: "Media", permission: "Media.View" },
  { href: "/admin/seo", label: "SEO & redirects", permission: "Seo.View" },
  { href: "/admin/settings", label: "Site settings", permission: "Settings.View" },
  { href: "/admin/users", label: "Users", permission: "Users.View" },
  { href: "/admin/roles", label: "Roles", permission: "Roles.View" },
  { href: "/admin/audit-logs", label: "Audit logs", permission: "Audit.View" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  return (
    <aside className="flex w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
          Generio CMS
        </p>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">Admin console</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {nav
          .filter((item) => hasPermission(item.permission))
          .map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--brand-primary-light)] text-[var(--brand-primary-dark)]"
                    : "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="border-t border-[var(--border)] p-3">
        <Link
          href="/"
          className="block rounded-md px-3 py-2 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]"
        >
          View public site
        </Link>
      </div>
    </aside>
  );
}

export function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-white px-6">
      <div>
        <p className="text-sm font-semibold text-[var(--ink)]">Generio Trading FZCO</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-[var(--ink)]">{user?.fullName}</p>
          <p className="text-xs text-[var(--ink-muted)]">{user?.roles.join(", ")}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
