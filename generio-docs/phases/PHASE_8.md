# Phase 8 — Media and SEO (English)

**Status:** Complete  
**Date:** 2026-07-14  

---

## Objectives

- Media library with upload + storage adapter  
- Light image processing (WebP, resize)  
- SEO management UI  
- Sitemap, robots, redirects  
- Publish English content end-to-end  

---

## Deliverables

| Item | Location |
|------|----------|
| `IMediaStorage` + Local adapter | `generio-api/Infrastructure/Storage/` |
| Cloud stub | `UnconfiguredCloudMediaStorage` (Blob/S3/R2 via `Storage:Provider`) |
| Upload API | `POST /api/admin/media/upload` |
| Static media | `/media/*` from `App_Data/media` |
| Redirect rules | Entity + admin CRUD + public API |
| SEO admin UI | `/admin/seo` |
| Media upload UI | `/admin/media` |
| MediaPicker upload | `MediaPicker.tsx` |
| Sitemap / robots | `src/app/sitemap.ts`, `robots.ts` |
| Rich metadata | `buildPageMetadata` + page SEO payload with OG image |
| Redirect middleware | `middleware.ts` |

### Config

```json
Storage.Provider=Local|AzureBlob|S3|CloudflareR2
Storage.PublicBaseUrl=http://localhost:5080
Storage.LocalRootPath=App_Data/media
Site.PublicBaseUrl=http://localhost:3000
```

Web: `NEXT_PUBLIC_SITE_URL` for robots/sitemap fallback.

### Deferred

- Full Azure Blob / S3 / R2 binary adapters (stub registered)  
- AVIF, folders, duplicate detection, usage tracking  
- Image CDN pipeline  

---

## Verification

- [x] Upload → WebP public URL  
- [x] SEO admin + redirects  
- [x] `/sitemap.xml` + `/robots.txt`  
- [x] Lint / build (web)  

**Phase 8 complete → ready for Phase 9 (Contact form & notifications).**
