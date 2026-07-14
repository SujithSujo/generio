# Local Development Setup

## Prerequisites

- Node.js 22+
- .NET SDK 10
- Docker Desktop (for PostgreSQL)

## Steps

1. Start database (host port **5433**):

```bash
docker compose up -d
```

2. Run API (`http://localhost:5080`):

```bash
cd generio-api
dotnet run --launch-profile http
```

On first start the API applies EF migrations and seeds the Super Admin user, roles, permissions, and site settings.

3. Run web (`http://localhost:3000`):

```bash
cd generio-web
cp .env.example .env.local
npm install
npm run dev
```

## Smoke checks

- Web home loads with Generio logo + tagline
- `GET http://localhost:5080/api/health` returns `{ "status": "ok" }`
- `POST http://localhost:5080/api/auth/login` with seeded admin credentials returns tokens
- Admin login works at http://localhost:3000/admin/login
- Dashboard / settings / users / roles / audit-logs load after sign-in

## Dev admin (change after first login)

- Email: `admin@generiogroup.com`
- Password: `ChangeMe!Generio1`

## Port notes

| Service | Port |
|---------|------|
| Next.js | 3000 |
| API | 5080 |
| Postgres (host) | 5433 |
| Postgres (container) | 5432 |
