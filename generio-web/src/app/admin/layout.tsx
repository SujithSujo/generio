"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AdminHeader, AdminSidebar } from "@/components/admin/AdminChrome";

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLogin || isLoading) return;
    if (!user) {
      router.replace("/admin/login");
    }
  }, [isLogin, isLoading, user, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-muted)] text-[var(--ink-muted)]">
        Loading admin…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--surface-muted)]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
