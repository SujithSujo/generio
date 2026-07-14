# Content Model (Phase 0 — Locked)

English MVP entities derived from Generio profile + CMS architecture.  
Seed data must come only from Generio sources (`CONTENT_INVENTORY.md`).

---

## Core entities

| Entity | Purpose | Seed in MVP? |
|--------|---------|--------------|
| SiteSettings | Logo, contact, social, CTAs | Yes (from inventory) |
| Page | Routable pages | Yes (sitemap pages) |
| PageSection | Home/inner controlled sections | Yes (section types below) |
| Service | Service groups + bullets | Yes (5 services) |
| Industry | Industries served | Yes (10 industries) |
| MarketRegion | Map regions | Yes (5 regions) |
| MarketCountry | Countries under regions | Yes (from inventory) |
| Partner | Partner network entries | No names yet — empty until assets |
| SuccessStory | Testimonials / stories | Empty until client provides |
| ContactEnquiry | Single form submissions | Runtime only |
| MediaFile | Uploads | Logo + future assets |
| SeoMetadata | Per-page / per-entity SEO | Defaults at build |
| User / Role / Permission | CMS access | Seed Super Admin |
| AuditLog | Admin actions | Runtime |

---

## Page section types (controlled builder)

| SectionType | Used on |
|-------------|---------|
| `hero` | Home |
| `introduction` | Home, About |
| `value_props` | Home, About (Why Generio) |
| `statistics` | Home |
| `services` | Home, Services |
| `markets_map` | Home teaser, Markets page |
| `industries` | Home, Industries |
| `partners` | Home, Partners |
| `success_stories` | Home, Success Stories |
| `contact_cta` | Home |
| `contact_form` | Contact |
| `rich_text` | Legal / About flexible blocks |

---

## Enquiry types (enum)

- `BrandOwner`  
- `Distributor`  
- `General`  
- `Other`  

One `ContactEnquiries` table; filter by `EnquiryType` in CMS.

---

## Markets map model

```text
MarketRegion
  - Name, Slug, Description
  - HighlightColor
  - BoundaryJson / CentroidLat / CentroidLng
  - DisplayOrder, IsActive

MarketCountry
  - MarketRegionId
  - Name, IsoCode (optional)
  - Latitude, Longitude (for pins)
  - ShortDescription
  - DisplayOrder, IsActive
```

Interactive map reads these entities — no hard-coded third-party market lists.

---

## Visibility rules for incomplete content

| Module | If empty |
|--------|----------|
| Partners | Hide section / show “Network overview” copy only |
| Success Stories | Hide nav item and home teaser until ≥1 published |
| Statistics | Hide or show only confirmed figures |
| Map | Always show using seeded Generio regions/countries |
