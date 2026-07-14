# Phase 2 — Auth and CMS Shell

**Status:** Complete  
**Date:** 2026-07-14  

---

## Objectives

- Admin login UI
- Roles and permissions (seeded + JWT claims)
- CMS shell: sidebar, header, dashboard
- Site settings management
- Audit logging basics

---

## Deliverables

### API

| Endpoint | Notes |
|----------|--------|
| `GET /api/admin/dashboard` | Counts + recent audit |
| `GET/PUT /api/admin/settings` | Site settings |
| `GET /api/admin/users` | User list |
| `GET /api/admin/roles` | Roles + permissions |
| `GET /api/admin/permissions` | Permission catalogue |
| `GET /api/admin/audit-logs` | Recent audit entries |

New entities/migration: `Permission`, `RolePermission`, `SiteSetting`, `AuditLog` → `Phase2CmsShell`

JWT access tokens now include `permission` claims. SuperAdministrator receives all permissions.

### Web

| Route | Purpose |
|-------|---------|
| `/admin/login` | Admin sign-in |
| `/admin/dashboard` | CMS metrics + recent audit |
| `/admin/settings` | Edit seeded site settings |
| `/admin/users` | User list |
| `/admin/roles` | Roles & permissions |
| `/admin/audit-logs` | Audit trail |

Shared chrome: `AdminSidebar` + `AdminHeader` with permission-filtered nav.

---

## Seeded permissions

- `Dashboard.View`
- `Settings.View` / `Settings.Edit`
- `Users.View` / `Users.Create` / `Users.Edit`
- `Roles.View` / `Roles.Edit`
- `Audit.View`

---

## Verification

- [x] Docker Postgres running (host **5433**)
- [x] API migrate/seed succeeded
- [x] Login API returns SuperAdministrator + permissions
- [x] Dashboard API returns users/roles/settings counts
- [x] Web and API started locally (`localhost:3000` / `localhost:5080`)

---

## Ops notes

- Remapped compose Postgres host port from 5432 → **5433** because another local Postgres was already bound to 5432.
- Next.js warns that `middleware` is deprecated in favor of `proxy` — revisit in a later polish phase.

**Phase 2 complete → ready for Phase 3 (Domain APIs).**
