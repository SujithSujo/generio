import { apiFetch } from "./api-client";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions?: string[];
  };
};

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function refresh(refreshToken: string) {
  return apiFetch<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function logout(refreshToken: string) {
  return apiFetch<void>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function fetchDashboard(accessToken: string) {
  return apiFetch<{
    users: number;
    roles: number;
    permissions: number;
    auditLogs: number;
    settings: number;
    pages: number;
    services: number;
    industries: number;
    marketRegions: number;
    partners: number;
    successStories: number;
    enquiries: number;
    newEnquiries: number;
    recentAudit: Array<{
      id: string;
      action: string;
      entityType: string;
      userEmail: string | null;
      createdAt: string;
    }>;
  }>("/api/admin/dashboard", { accessToken });
}

export function fetchSettings(accessToken: string) {
  return apiFetch<
    Array<{
      id: string;
      key: string;
      value: string;
      description: string | null;
      updatedAt: string;
    }>
  >("/api/admin/settings", { accessToken });
}

export function updateSettings(
  accessToken: string,
  settings: Array<{ key: string; value: string }>,
) {
  return apiFetch("/api/admin/settings", {
    method: "PUT",
    accessToken,
    body: JSON.stringify({ settings }),
  });
}

export function fetchUsers(accessToken: string) {
  return apiFetch<
    Array<{
      id: string;
      email: string;
      fullName: string;
      isActive: boolean;
      createdAt: string;
      lastLoginAt: string | null;
      roles: string[];
    }>
  >("/api/admin/users", { accessToken });
}

export function fetchRoles(accessToken: string) {
  return apiFetch<
    Array<{
      id: string;
      name: string;
      description: string | null;
      permissions: string[];
      userCount: number;
    }>
  >("/api/admin/roles", { accessToken });
}

export function fetchAuditLogs(accessToken: string) {
  return apiFetch<
    Array<{
      id: string;
      userEmail: string | null;
      action: string;
      entityType: string;
      entityId: string | null;
      details: string | null;
      ipAddress: string | null;
      createdAt: string;
    }>
  >("/api/admin/audit-logs?take=50", { accessToken });
}
