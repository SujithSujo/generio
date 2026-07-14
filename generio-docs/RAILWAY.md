# Deploy Generio on Railway

Monorepo layout: two app services (`generio-api`, `generio-web`) plus Railway **PostgreSQL**.

Repo: connect GitHub `SujithSujo/generio` (or your fork). Use **root directory** per service so each Dockerfile builds only its folder.

---

## 1. Create the project

1. [Railway](https://railway.app) → **New Project**.
2. Add **PostgreSQL** (plugin). Note the `DATABASE_URL` variable it creates.
3. Add two **Empty services** (or deploy from GitHub twice):
   - `generio-api`
   - `generio-web`

Connect the same GitHub repo to both services.

---

## 2. API service (`generio-api`)

| Setting | Value |
|---------|--------|
| Root Directory | `generio-api` |
| Builder | Dockerfile (`railway.toml` selects this) |
| Healthcheck | `/api/health` |

### Variables (API)

Copy / link these after Postgres and the web service have public URLs:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | **Reference** → Postgres `DATABASE_URL` (required) |
| `ASPNETCORE_ENVIRONMENT` | `Production` (Dockerfile also defaults this) |
| `Jwt__SigningKey` | Long random secret (32+ chars) |
| `Jwt__Issuer` | `generio-api` |
| `Jwt__Audience` | `generio-web` |
| `Cors__AllowedOrigins__0` | Web public URL, e.g. `https://your-web.up.railway.app` (no trailing slash) |
| `Storage__Provider` | `Local` |
| `Storage__PublicBaseUrl` | API public URL, e.g. `https://your-api.up.railway.app` |
| `Site__PublicBaseUrl` | Web public URL |
| `Seed__AdminEmail` | Your admin email |
| `Seed__AdminPassword` | Strong password (change after first login) |

Do **not** set `ConnectionStrings__Default` to `Host=localhost;Port=5433…` on Railway.

**Common failure:** `Failed to connect to 127.0.0.1:5433` — the API never received Postgres credentials.

1. API service → **Variables**
2. Delete any `ConnectionStrings__Default` pointing at localhost
3. **Add variable** → **Add reference** → Postgres → `DATABASE_URL` (or `DATABASE_PRIVATE_URL`)
4. Redeploy the API


Optional:

| Variable | Notes |
|----------|--------|
| `Email__Provider` | `Console` (default) or `Smtp` |
| `Email__SmtpHost` / `SmtpPort` / `SmtpUsername` / `SmtpPassword` | If using SMTP |
| `Captcha__Enabled` | `true` + Turnstile keys for production form protection |
| `WhatsApp__Enabled` | Keep `false` until a WhatsApp provider is wired |

### Media volume (recommended)

Local uploads write under `App_Data/media`. Attach a Railway **volume** mounted at `/app/App_Data/media` so uploads survive redeploys.

Without a volume, media is lost on each deploy.

Generate a public domain for the API (Settings → Networking → Generate Domain).

---

## 3. Web service (`generio-web`)

| Setting | Value |
|---------|--------|
| Root Directory | `generio-web` |
| Builder | Dockerfile |
| Healthcheck | `/` |

### Build / runtime variables (Web)

`NEXT_PUBLIC_*` values are **baked in at Docker build**. Set them as service variables **before** the first successful build (or redeploy after changing them).

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | API public URL (no trailing slash) |
| `NEXT_PUBLIC_SITE_URL` | Web public URL (no trailing slash) |
| `NEXT_PUBLIC_SITE_NAME` | `Generio Trading FZCO` |
| `NEXT_PUBLIC_SITE_TAGLINE` | `Your Gateway to Emerging Markets` |

Railway injects `PORT`; the image listens on `0.0.0.0` via standalone `server.js`.

Generate a public domain for the web service, then update:

1. Web `NEXT_PUBLIC_*` URLs → redeploy web  
2. API `Cors__AllowedOrigins__0` and `Site__PublicBaseUrl` / `Storage__PublicBaseUrl` → redeploy API  

---

## 4. Deploy order

1. Postgres online  
2. Deploy **API** (migrate + seed run on startup)  
3. Deploy **Web**  
4. Align CORS and `NEXT_PUBLIC_*` once both domains exist  
5. Log into `/admin` with the seed admin credentials and change the password  

---

## 5. Custom domains

In each service → **Settings → Domains**, add e.g. `www.generiogroup.com` (web) and `api.generiogroup.com` (API). Update CORS and `NEXT_PUBLIC_*` to those hostnames and redeploy.

---

## 6. Verify

- `GET https://<api>/api/health` → `{ "status": "ok", ... }`  
- `https://<web>/` loads the marketing site  
- `https://<web>/admin/login` works against the API  
- Contact form creates an enquiry in admin inbox  

---

## Local Docker smoke test (optional)

```bash
# from generio-api
docker build -t generio-api .
docker run --rm -e PORT=8080 -e ASPNETCORE_ENVIRONMENT=Production \
  -e DATABASE_URL="postgresql://..." -e Jwt__SigningKey="..." \
  -p 8080:8080 generio-api

# from generio-web
docker build -t generio-web \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://your-api.example \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-web.example \
  .
docker run --rm -e PORT=3000 -p 3000:3000 generio-web
```

---

## Notes

- **DATABASE_URL** wins over `ConnectionStrings:Default` (empty in Production).  
- File Serilog sinks are Development-only; production logs go to stdout (Railway logs).  
- For durable media long-term, switch `Storage__Provider` to a cloud blob store when ready; Local + volume is fine for MVP.
