# Phase 6 — Interactive Regional Coverage Map

**Status:** Complete  
**Date:** 2026-07-14  

---

## Objectives

- Interactive regional coverage map UI  
- CMS region/country data binding  
- Tooltips / detail panel + accessibility  
- Markets page as the primary map experience  
- Mobile-friendly fallback  

---

## Deliverables

| Item | Location |
|------|----------|
| `CoverageMap` | `src/components/public/CoverageMap.tsx` |
| Markets page | `src/app/(public)/markets/page.tsx` |
| Country coordinates | API `ContentSeeder.EnrichCountryCoordinatesAsync` |
| Map motion styles | `globals.css` (`map-pulse`, SVG focus) |

### Experience

- Leaflet geographic basemap (Esri World Imagery) + Generio region/country overlays  
- Client-only map (`CoverageMap` dynamic import, `CoverageMapClient`)  
- Click/keyboard select regions → fly-to + country pins  
- Side detail panel with country list (desktop)  
- Horizontal region rail on mobile  
- Home teaser CTA: “Open interactive map”  

### Data

Regions and countries come from `/api/public/markets`. Pins use stored lat/lng when present; otherwise orbit the region centroid.

---

## Verification

- [x] API seed enriches coordinates  
- [x] Lint / build  
- [x] Docs updated  

**Phase 6 complete → ready for Phase 7 (CMS Content Modules).**
