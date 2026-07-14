# Phase 1 — Technical Foundation

**Status:** Complete  
**Date:** 2026-07-14  

---

## Objectives

- Monorepo layout (`generio-web`, `generio-api`, docs, compose)
- Next.js + TypeScript + Tailwind foundation with Generio brand tokens
- ASP.NET Core 10 API + EF Core + PostgreSQL
- Swappable storage/hosting env configuration
- Serilog logging
- Base GitHub Actions CI
- JWT + refresh-token auth skeleton with role seed

---

## Deliverables

| Item | Location |
|------|----------|
| Solution | `Generio.slnx` |
| Web app | `generio-web/` (Next.js 16, React 19, Tailwind 4) |
| API | `generio-api/` (net10.0) |
| Postgres compose | `docker-compose.yml` |
| Env templates | `.env.example`, `generio-web/.env.example` |
| CI | `.github/workflows/ci.yml` |
| Auth migration | `generio-api/Infrastructure/Data/Migrations/*InitialAuth*` |
| Root readme | `README.md` |

---

## Auth skeleton

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/health` | GET | Public |
| `/api/auth/login` | POST | Public |
| `/api/auth/refresh` | POST | Public |
| `/api/auth/logout` | POST | Public |
| `/api/auth/me` | GET | Bearer JWT |

Seeded roles: SuperAdministrator, ContentAdministrator, MarketingUser, EnquiryManager, Translator, Viewer  

Dev admin (change immediately): `admin@generiogroup.com` / `ChangeMe!Generio1`

---

## Storage / cloud config (swappable)

`Storage:Provider` = `Local` | `AzureBlob` | `S3` | `CloudflareR2`  

Hosting remains open until Phase 10 (Vercel / Azure / Railway / Neon / Supabase / etc.).

---

## Verification

- [x] `dotnet build` (API) succeeds
- [x] `npm run build` (web) succeeds
- [x] `npm run lint` (web) succeeds
- [x] EF `InitialAuth` migration created
- [ ] `docker compose up -d` — **blocked locally**: Docker Desktop daemon was not running at Phase 1 completion; start Docker then run compose + API to apply migrations

---

## How to run locally

```bash
docker compose up -d
cd generio-api && dotnet run --launch-profile http
cd generio-web && npm run dev
```

- Web: http://localhost:3000  
- API: http://localhost:5080/api/health  

---

## Notes

- OpenAPI package NU1903 warning remains from ASP.NET OpenAPI dependency; monitor for patched package.
- Full CMS UI and domain CRUD start in later phases.
- English-only public shell expands in Phase 4+.

**Phase 1 complete → ready for Phase 2 (Auth and CMS Shell).**
