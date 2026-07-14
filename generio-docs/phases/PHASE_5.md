# Phase 5 — Home and Core Marketing Pages

**Status:** Complete  
**Date:** 2026-07-14  

---

## Objectives

Polish the English public marketing experience with a distinctive editorial design — not Bootstrap-style card grids.

---

## Design direction

- Full-bleed atmospheric hero with Generio brand as the primary signal  
- Route-line SVG motion + scroll reveals (IntersectionObserver)  
- Editorial numbered lists / dividers instead of generic cards  
- Deep brand navy markets band  
- Fixed glass header (transparent on home until scroll)  
- Dark editorial footer  

Generio content only; no third-party site data.

---

## Deliverables

| Area | Change |
|------|--------|
| `sections.tsx` | Full redesign of hero, about, why, services, markets, industries, partners, CTA |
| `SiteHeader.tsx` / `SiteFooter.tsx` | Elevated navigation chrome |
| `globals.css` | Atmosphere, grain, reveal, route-draw, link-sheen |
| `Reveal.tsx` | Scroll-triggered motion helper |
| Service detail | Large typography layout with numbered focus list |
| Routes | Home + inner pages consume polished sections |

---

## Verification

- [x] Lint clean  
- [x] Production build succeeds  
- [x] Docs updated  

**Phase 5 complete → ready for Phase 6 (Interactive Regional Coverage Map).**
