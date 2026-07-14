# Phase 3 — Domain APIs

**Status:** Complete  
**Date:** 2026-07-14  

---

## Objectives

English content-domain APIs for Generio CMS + public site:

- Pages / sections  
- Services  
- Industries  
- Markets / regions (+ countries)  
- Partner network  
- Success stories  
- SEO metadata  
- Media metadata  
- Single contact enquiry API (`EnquiryType`)

---

## Deliverables

| Area | Detail |
|------|--------|
| Migration | `Phase3DomainContent` |
| Seed | Generio inventory only (5 services, 10 industries, 5 regions + countries, 11 pages + sections, SEO) |
| Public API | `/api/public/*` read + enquiry POST |
| Admin API | `/api/admin/*` content CRUD |
| Permissions | Pages/Services/Industries/Markets/Partners/Stories/Enquiries/Media/SEO View+Edit |

### Public endpoints

- `GET /api/public/site-settings`
- `GET /api/public/pages` · `GET /api/public/pages/{slug}`
- `GET /api/public/services` · `GET /api/public/services/{slug}`
- `GET /api/public/industries`
- `GET /api/public/markets`
- `GET /api/public/partners`
- `GET /api/public/success-stories`
- `GET /api/public/seo/{entityType}/{entityId}`
- `POST /api/public/enquiries` (requires consent + EnquiryType)

### Admin endpoints (auth + permission)

- Pages (+ section replace)  
- Services / Industries / Markets (regions + countries)  
- Partners / Success stories  
- Enquiries list + status update  
- Media metadata CRUD (soft delete)  
- SEO upsert  

Partners and success stories stay empty until Generio supplies assets (as locked in Phase 0).

---

## Verification

- [x] Build + migrate + seed
- [x] Public counts: 5 services, 10 industries, 5 regions, 11 pages
- [x] Enquiry POST creates `New` record
- [x] Admin dashboard returns content counters

**Phase 3 complete → ready for Phase 4 (Public Site Foundation).**
