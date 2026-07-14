# Generio Platform

Corporate website + CMS for **Generio Trading FZCO**.

| Path | Description |
|------|-------------|
| `generio-web/` | Next.js public site + admin CMS |
| `generio-api/` | ASP.NET Core 10 Web API |
| `generio-docs/` | Architecture, brand, phase status |
| `docker-compose.yml` | Local PostgreSQL |

## Quick start

```bash
# 1. Database (host port 5433 → container 5432)
docker compose up -d

# 2. API (http://localhost:5080)
cd generio-api
dotnet run --launch-profile http

# 3. Web (http://localhost:3000)
cd generio-web
cp .env.example .env.local
npm install
npm run dev
```

> Postgres uses host port **5433** so it does not collide with other local Postgres services on 5432.

### Admin CMS

- Login: http://localhost:3000/admin/login  
- Dashboard: http://localhost:3000/admin/dashboard  

Default seeded admin (dev only — change immediately):

- Email: `admin@generiogroup.com`
- Password: `ChangeMe!Generio1`

## Environment

See `.env.example` (root) and `generio-web/.env.example`.

Storage / hosting providers stay swappable (`Storage:Provider` = `Local` | `AzureBlob` | `S3` | `CloudflareR2`).

## Phase status

See `generio-docs/PHASE_STATUS.md`.
