# GENERIO UAE — Dynamic Website Architecture

## 1. Project Overview

GENERIO Trading FZCO will be developed as a dynamic corporate website for a Dubai-based business development and market expansion company. The architecture and presentation patterns may follow modern corporate site conventions, but **all page content, services, markets, brands, copy, and media must be Generio-owned**. Do not import or reuse content, brands, services, or data from any reference site.

- Company: Generio Trading FZCO
- Frontend: Next.js / React
- Language: TypeScript
- CMS: Custom CMS admin panel
- Backend: ASP.NET Core 10 Web API
- Database: PostgreSQL
- Media Storage (choose at deploy time): Azure Blob Storage, AWS S3, or Cloudflare R2
- Languages: **English first (MVP)**; Arabic (RTL) planned as a later phase
- Deployment options (choose at deploy time): Vercel, Azure App Service, Railway, or equivalent
- Contact: **one unified contact / enquiry form**
- Markets: **interactive regional coverage map** (CMS-managed regions)

The website will provide a modern corporate presentation with editable pages, services, industries, markets/regions, partner network, testimonials, SEO settings, media management, and enquiry processing. Multilingual (Arabic) support is architected early but delivered after the English launch.

### Locked product decisions

| Decision | Choice |
|----------|--------|
| Content source | Generio company profile only — no reference-site data |
| Sitemap | Merged Generio IA (markets, industries, partners) + CMS section model |
| Contact | One contact form for all enquiry types |
| Markets UX | Interactive regional coverage map |
| Language launch | English-only first; Arabic later |
| Cloud / hosting | Keep all documented options selectable at deployment |
| Tagline (MVP) | Your Gateway to Emerging Markets |
| Brand primary | `#1B9DD9` (from official logo) |
| Typography | Plus Jakarta Sans (headings) + Source Sans 3 (body) |

**Phase 0 docs:** see `generio-docs/` (`BRAND.md`, `SITEMAP.md`, `CONTENT_INVENTORY.md`, `CONTENT_MODEL.md`, `PHASE_STATUS.md`).

---

## 2. Recommended Technology Stack

### Public Website

- Next.js 15+
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod
- TanStack Query
- Axios
- Swiper.js
- Lucide React

### CMS Admin Panel

The CMS can be built inside the same Next.js application using protected admin routes.

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- TanStack Table
- React Hook Form
- Zod
- TipTap rich-text editor
- Recharts
- Auth.js or custom JWT authentication

### Backend API

- ASP.NET Core 10 Web API
- Entity Framework Core
- PostgreSQL
- FluentValidation
- AutoMapper
- Serilog
- JWT access tokens
- Refresh tokens
- Role-based access control
- Permission-based authorization
- Background email and notification processing

---

## 3. High-Level Solution Architecture

```text
GENERIO Platform
│
├── Next.js Public Website (English MVP)
│   ├── Home
│   ├── About Generio
│   ├── Services
│   ├── Markets We Cover (interactive map)
│   ├── Industries
│   ├── Partner Network
│   ├── Success Stories / Testimonials
│   ├── Contact (single enquiry form)
│   └── Legal Pages
│
├── Next.js CMS Admin
│   ├── Dashboard
│   ├── Page Management
│   ├── Section Management
│   ├── Service Management
│   ├── Industry Management
│   ├── Market / Region Management
│   ├── Partner Network Management
│   ├── Testimonial / Success Story Management
│   ├── Enquiry Management (single form inbox)
│   ├── Media Library
│   ├── SEO Management
│   ├── Translation Management (post-MVP Arabic)
│   └── User and Role Management
│
├── ASP.NET Core API
│   ├── Authentication
│   ├── CMS APIs
│   ├── Public Website APIs
│   ├── Enquiry APIs
│   ├── Media APIs
│   ├── SEO APIs
│   ├── Translation APIs
│   └── Audit APIs
│
├── PostgreSQL Database
│
└── Cloud Storage (any one of)
    ├── Azure Blob Storage
    ├── AWS S3
    └── Cloudflare R2
```

---

## 4. Public Website Structure

### 4.1 Header

CMS-editable fields:

- Company logo
- Navigation menu
- Language switcher
- Call-to-action button
- Sticky header option
- Social media links
- Header contact information

Suggested menu:

- Home
- About Generio
- Services
- Markets We Cover
- Industries
- Partner Network
- Success Stories
- Contact

### 4.2 Hero Section

CMS-editable fields:

- Main heading
- Subheading
- Description
- Background image or video
- Primary CTA
- Secondary CTA
- Text alignment
- Overlay opacity
- Animation type

Example headline:

> Your Gateway to Emerging Markets

(Use Generio-approved tagline options only; do not copy headlines from other sites.)

### 4.3 Company Introduction

Fields:

- Section title
- Subtitle
- Short company profile
- Detailed description
- Feature image
- CTA link
- Core values
- Mission and vision

### 4.4 Statistics Section

CMS-managed counters such as:

- Markets served
- Customers
- Points of sale
- Team members
- Years of experience
- Warehouse capacity
- Brands represented
- SKUs managed

Each statistic should support:

- Label
- Number
- Prefix
- Suffix
- Icon
- Display order
- Active/inactive status

### 4.5 What We Do / Services

Generio service groups (content from Generio company profile only):

- Brand Expansion & Market Entry
- Distributor Network Development
- Business Development Services
- Trade & Supply Chain Support
- Brand Management

Each service should include:

- Title
- Slug
- Icon
- Short description
- Full description
- Featured image
- CTA
- Display order
- Featured status
- Active/inactive status
- SEO metadata

### 4.6 Industries Served

CMS-managed industry list (e.g. FMCG, Food & Beverage, Personal Care, Cosmetics & Beauty, Healthcare & OTC, Household, Baby Care, Nutritional, Consumer Goods, Specialty).

Fields:

- Name
- Slug
- Short description
- Icon / image
- Display order
- Active/inactive status

### 4.7 Markets We Cover — Interactive Regional Map

Replace a simple office-list page with an **interactive regional coverage map**.

Suggested regions (CMS-managed; Generio coverage only):

- GCC
- Levant & Iraq
- South & Central Asia
- Africa
- Iran & Neighboring Markets

Each region / market pin should support:

- Region name
- Country list
- Short description
- Map coordinates / boundary data
- Highlight colour
- Display order
- Active/inactive status
- Linked detail content

Map behaviour:

- Clickable regions and/or country pins
- Hover / focus tooltips
- Side panel or modal with market summary
- Mobile-friendly fallback list view
- All map data editable from CMS (no hard-coded third-party site data)

Optional office fields (if Generio publishes physical offices later) remain supported via a Locations entity, but the primary public UX is the coverage map.

### 4.8 Partner Network

CMS fields for featured partners / network highlights:

- Partner or network label
- Logo
- Category (brand owner, distributor, retailer, etc.)
- Short description
- Website URL (optional)
- Display order
- Featured status
- Active/inactive status

Do not populate with logos or brands scraped from other websites.

### 4.9 Success Stories / Testimonials

Fields:

- Story or testimonial text
- Person name
- Designation
- Company
- Person image
- Company logo
- Rating
- Display order
- Active/inactive status

### 4.10 Contact — Single Enquiry Form

One form for all visitors (brand owners, distributors, general). Route intent via a dropdown, not separate forms.

Contact information:

- General enquiry email
- Phone
- WhatsApp
- Office address (Dubai, UAE)
- Working hours
- Google Maps embed

Single contact form fields:

- Name
- Email
- Phone
- Company
- Enquiry type (Brand Owner / Distributor / General / Other)
- Subject
- Interested service (optional)
- Message
- Attachment (optional)
- Consent checkbox

No separate Brand Owner or Distributor application forms in MVP.

### 4.11 Footer

CMS-editable fields:

- Logo
- Company description
- Quick links
- Contact information
- Social media links
- Newsletter form
- Copyright
- Privacy policy
- Terms and conditions
- Cookie policy

---

## 5. CMS Admin Modules

### 5.1 Dashboard

Widgets:

- Total enquiries
- New enquiries
- Total brands
- Total services
- Total locations
- Total testimonials
- Recently updated pages
- Website traffic summary
- Latest enquiries
- Pending translations
- Media usage
- User activity

### 5.2 CMS Modules

1. Site settings
2. Header and menu management
3. Page management
4. Section management
5. Hero banner management
6. Statistics management
7. Service management
8. Industry management
9. Market / region map management
10. Partner network management
11. Testimonial / success story management
12. Contact enquiry management (single form inbox)
13. Footer management
14. SEO management
15. Media library
16. Language and translation management (post-MVP Arabic)
17. User management
18. Role management
19. Permission management
20. Audit logs
21. Redirect management
22. Form settings
23. Email template management

---

## 6. Next.js Application Structure

```text
generio-web/
│
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── about/
│   │   │   │   ├── services/
│   │   │   │   ├── markets/
│   │   │   │   ├── industries/
│   │   │   │   ├── partners/
│   │   │   │   ├── success-stories/
│   │   │   │   ├── contact/
│   │   │   │   ├── privacy-policy/
│   │   │   │   └── terms/
│   │   │   │
│   │   │   └── layout.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── pages/
│   │   │   ├── sections/
│   │   │   ├── services/
│   │   │   ├── brands/
│   │   │   ├── locations/
│   │   │   ├── testimonials/
│   │   │   ├── enquiries/
│   │   │   ├── media/
│   │   │   ├── seo/
│   │   │   ├── translations/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   └── settings/
│   │   │
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── public/
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── StatisticsSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── MarketSection.tsx
│   │   │   ├── BrandsSection.tsx
│   │   │   ├── LocationsSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── MediaPicker.tsx
│   │   │   ├── RichTextEditor.tsx
│   │   │   ├── SeoForm.tsx
│   │   │   └── LanguageEditor.tsx
│   │   │
│   │   └── ui/
│   │
│   ├── features/
│   │   ├── authentication/
│   │   ├── pages/
│   │   ├── sections/
│   │   ├── services/
│   │   ├── brands/
│   │   ├── locations/
│   │   ├── testimonials/
│   │   ├── enquiries/
│   │   ├── media/
│   │   ├── seo/
│   │   └── settings/
│   │
│   ├── services/
│   │   ├── api-client.ts
│   │   ├── auth-service.ts
│   │   ├── page-service.ts
│   │   ├── brand-service.ts
│   │   ├── service-service.ts
│   │   └── enquiry-service.ts
│   │
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── validators/
│   ├── providers/
│   └── middleware.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 7. Rendering Strategy

### Static Generation

Use for:

- Privacy policy
- Terms and conditions
- Cookie policy
- Mostly static legal pages

### Server-Side Rendering

Use for:

- Home page
- Services
- Brands
- Locations
- Testimonials
- Contact information

### Incremental Static Regeneration

Recommended for most CMS-powered public pages.

```ts
export const revalidate = 300;
```

This allows cached pages to refresh every five minutes while maintaining high performance.

For immediate publishing, the API can trigger Next.js on-demand revalidation when content is published.

---

## 8. CMS Page Builder

Use a controlled section-based page builder rather than a completely unrestricted drag-and-drop builder.

```text
Page
 ├── Hero Section
 ├── Introduction Section
 ├── Statistics Section
 ├── Services Section
 ├── Markets Map Teaser
 ├── Industries Section
 ├── Partner Network Section
 ├── Success Stories Section
 └── Contact Section
```

Each section should support:

- Section type
- Title
- Subtitle
- Description
- Background image
- Background colour
- Text alignment
- Display order
- Visibility
- CTA button
- Animation type
- Section-specific settings
- Language-specific content

A structured builder maintains brand consistency and reduces CMS complexity.

---

## 9. Core Database Structure

### Pages

```text
Pages
- Id
- Name
- Slug
- Title
- PageType
- Status
- IsPublished
- PublishedAt
- CreatedAt
- UpdatedAt
```

### Page Sections

```text
PageSections
- Id
- PageId
- SectionType
- Title
- Subtitle
- Description
- ContentJson
- BackgroundImageId
- DisplayOrder
- IsVisible
- CreatedAt
- UpdatedAt
```

Example `ContentJson`:

```json
{
  "buttonText": "Explore Our Services",
  "buttonUrl": "/services",
  "alignment": "left",
  "overlayOpacity": 0.45,
  "animation": "fade-up"
}
```

### Services

```text
Services
- Id
- Title
- Slug
- ShortDescription
- FullDescription
- Icon
- FeaturedImageId
- DisplayOrder
- IsFeatured
- IsActive
- SeoTitle
- SeoDescription
- CreatedAt
- UpdatedAt
```

### Brands

```text
Brands
- Id
- BrandCategoryId
- Name
- Slug
- LogoMediaId
- Description
- WebsiteUrl
- DisplayOrder
- IsFeatured
- IsActive
- CreatedAt
- UpdatedAt
```

### Brand Categories

```text
BrandCategories
- Id
- Name
- Slug
- Description
- DisplayOrder
- IsActive
```

### Locations

```text
Locations
- Id
- Name
- Emirate
- Country
- Address
- Phone
- Email
- WhatsApp
- Latitude
- Longitude
- GoogleMapsUrl
- DisplayOrder
- IsActive
```

### Testimonials

```text
Testimonials
- Id
- PersonName
- Designation
- CompanyName
- TestimonialText
- PersonImageId
- CompanyLogoId
- Rating
- DisplayOrder
- IsActive
```

### Contact Enquiries

```text
ContactEnquiries
- Id
- Name
- Company
- Email
- Phone
- EnquiryType
- Subject
- Message
- ServiceId
- Status
- InternalRemarks
- AssignedToUserId
- SubmittedAt
- IpAddress
```

`EnquiryType` values: BrandOwner | Distributor | General | Other

One inbox for all enquiries — no separate form entities.

### Media Files

```text
MediaFiles
- Id
- FileName
- OriginalFileName
- MimeType
- StorageProvider
- StoragePath
- PublicUrl
- AltText
- Width
- Height
- FileSize
- UploadedByUserId
- CreatedAt
```

### SEO Metadata

```text
SeoMetadata
- Id
- EntityType
- EntityId
- LanguageCode
- SeoTitle
- MetaDescription
- CanonicalUrl
- OpenGraphTitle
- OpenGraphDescription
- OpenGraphImageId
- RobotsIndex
- RobotsFollow
- StructuredDataJson
```

### Languages and Translations

```text
Languages
- Id
- Code
- Name
- IsDefault
- IsRtl
- IsActive
```

```text
Translations
- Id
- EntityType
- EntityId
- LanguageCode
- FieldName
- TranslatedValue
- Status
- UpdatedAt
```

### Users, Roles, and Permissions

```text
Users
Roles
Permissions
UserRoles
RolePermissions
RefreshTokens
AuditLogs
```

---

## 10. Multilingual Support

Launch strategy:

- **MVP: English only**
- **Phase 2 language work: Arabic (RTL)** after English site is live

Primary languages (planned):

- English (launch)
- Arabic (post-MVP)

Future languages:

- French
- Hindi

Recommended routing (enable when Arabic is added):

```text
/en
/ar
```

Until Arabic ships, routes may be unprefixed English pages or a fixed `/en` prefix — decide in foundation, but do not block MVP on dual-locale UI.

Recommended library:

- next-intl (install early; Arabic locale content later)

Post-MVP Arabic requirements:

- Full RTL support
- Translation content managed from CMS
- Language-specific SEO metadata
- Language-specific slugs where required
- Localized navigation
- Localized validation messages
- Locale-aware dates and numbers

---

## 11. Authentication and Permissions

### Roles

#### Super Administrator

Full system access.

#### Content Administrator

Manage pages, sections, media, services, brands, locations, and testimonials.

#### Marketing User

Manage campaigns, banners, featured sections, testimonials, and SEO.

#### Enquiry Manager

View, assign, update, and export enquiries.

#### Translator

Manage translations only.

#### Viewer

Read-only CMS access.

### Permission Examples

```text
Pages.View
Pages.Create
Pages.Edit
Pages.Delete
Pages.Publish

Brands.View
Brands.Create
Brands.Edit
Brands.Delete

Services.View
Services.Create
Services.Edit
Services.Delete

Enquiries.View
Enquiries.Assign
Enquiries.Export
Enquiries.Delete

Media.View
Media.Upload
Media.Edit
Media.Delete

Users.View
Users.Create
Users.Edit
Users.Disable
```

---

## 12. Media Library

The CMS media library should support:

- Image upload
- Video upload
- PDF upload
- Image preview
- Folder organization
- Search
- Alt text
- File title
- Image compression
- WebP or AVIF conversion
- Multiple image sizes
- Duplicate detection
- Usage tracking
- File replacement
- Soft deletion

Recommended storage:

- Azure Blob Storage
- Cloudflare R2
- AWS S3

Do not store uploaded files directly inside the deployed Next.js application.

---

## 13. SEO Architecture

Each page should support:

- SEO title
- Meta description
- Canonical URL
- Open Graph title
- Open Graph description
- Open Graph image
- Robots index/follow controls
- Structured data
- Sitemap priority
- Redirect URL

Next.js should generate:

```text
/sitemap.xml
/robots.txt
```

Structured data types:

- Organization
- LocalBusiness
- Service
- BreadcrumbList
- WebPage
- ContactPage

Additional SEO requirements:

- Clean slugs
- Canonical URLs
- Image alt text
- Fast Core Web Vitals
- Server-rendered metadata
- 301 redirects
- Broken-link monitoring
- Multilingual hreflang tags

---

## 14. Contact Enquiry Workflow

Single form only. Enquiry type is a field on the same form.

```text
Visitor submits the one contact form
        ↓
Next.js validates fields
        ↓
Request sent to ASP.NET Core API
        ↓
API validates and saves enquiry (with EnquiryType)
        ↓
Email notification sent
        ↓
Optional WhatsApp notification
        ↓
Enquiry appears in CMS inbox
        ↓
Admin assigns and updates status
```

Statuses:

- New
- Contacted
- In Progress
- Qualified
- Closed
- Spam

Additional capabilities:

- Enquiry type filter (Brand Owner / Distributor / General / Other)
- Internal remarks
- Assignment to staff
- Export to CSV or Excel
- Search and filters
- Email response templates
- Spam prevention
- CAPTCHA
- Rate limiting
- Audit trail

---

## 15. API Structure

Suggested API routes:

```text
/api/auth
/api/auth/login
/api/auth/refresh
/api/auth/logout

/api/public/pages
/api/public/services
/api/public/brands
/api/public/locations
/api/public/testimonials
/api/public/site-settings
/api/public/enquiries

/api/admin/pages
/api/admin/page-sections
/api/admin/services
/api/admin/brands
/api/admin/brand-categories
/api/admin/locations
/api/admin/testimonials
/api/admin/enquiries
/api/admin/media
/api/admin/seo
/api/admin/translations
/api/admin/users
/api/admin/roles
/api/admin/permissions
/api/admin/audit-logs
/api/admin/settings
```

Public endpoints should be read-only except for forms such as contact enquiries.

Admin endpoints must require authentication and permission checks.

---

## 16. Security Requirements

- HTTPS only
- JWT access tokens
- Refresh token rotation
- Role and permission enforcement
- Secure HTTP-only cookies where appropriate
- Input validation
- Output encoding
- CSRF protection
- XSS protection
- SQL injection prevention through EF Core
- Rate limiting
- CAPTCHA for forms
- File upload validation
- Malware scanning for uploads
- Audit logging
- Secure secret storage
- Backup and recovery
- Content Security Policy
- Security headers
- Admin session timeout
- Optional multi-factor authentication

---

## 17. Deployment Architecture

All cloud options remain valid; pick concrete providers at deployment without changing app architecture.

```text
User
  ↓
CDN and WAF (Cloudflare recommended)
  ↓
Next.js Frontend
Vercel  |  Azure App Service  |  Railway  |  equivalent
  ↓
ASP.NET Core API
Azure App Service  |  Railway  |  equivalent
  ↓
PostgreSQL
Azure Database for PostgreSQL  |  Supabase  |  Neon  |  equivalent
  ↓
Object storage
Azure Blob Storage  |  AWS S3  |  Cloudflare R2
```

Selectable production combinations (examples):

| Concern | Options |
|---------|---------|
| Frontend | Vercel, Azure App Service, Railway |
| Backend | Azure App Service, Railway |
| Database | Azure PostgreSQL, Supabase, Neon |
| Media | Azure Blob, AWS S3, Cloudflare R2 |
| CDN / security | Cloudflare |
| Email | SendGrid, Postmark, Azure Communication Services |
| Monitoring | Azure Application Insights, Sentry |
| Logs | Serilog + centralized store |
| CI/CD | GitHub Actions |

Prefer abstracting storage and config behind interfaces so any listed option can be swapped via environment settings.

---

## 18. Repository Structure

```text
generio-platform/
│
├── generio-web/
│   └── Next.js public website and CMS
│
├── generio-api/
│   └── ASP.NET Core Web API
│
├── generio-docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API_SPECIFICATION.md
│   ├── CMS_REQUIREMENTS.md
│   ├── SECURITY.md
│   └── DEPLOYMENT.md
│
└── docker-compose.yml
```

---

## 19. Development Phases — Final Roadmap

### Phase 0 — Discovery and Content Lock ✅ Complete (2026-07-14)

- [x] Use Generio company profile as the only content source
- [x] Do not import data, brands, services, or copy from any other website
- [x] Approve merged sitemap: Home, About, Services, Markets (map), Industries, Partner Network, Success Stories, Contact, Legal
- [x] Confirm tagline, logo, colour palette, typography
- [x] Collect Generio media and copy (services, industries, regions, contact details)
- [x] Lock MVP scope: English only, one contact form, interactive coverage map
- [x] Keep all cloud providers as open options until deploy

**Artifacts:** `generio-docs/phases/PHASE_0.md`, `BRAND.md`, `SITEMAP.md`, `CONTENT_INVENTORY.md`, `CONTENT_MODEL.md`

**Open (non-blocking):** vector logo, LinkedIn URL, statistics numbers, partner logos, success stories, hero imagery, legal copy

### Phase 1 — Technical Foundation ✅ Complete (2026-07-14)

- [x] Create monorepo (`generio-web`, `generio-api`, docs, docker-compose)
- [x] Configure Next.js + TypeScript + Tailwind (brand fonts/tokens)
- [x] Configure ASP.NET Core 10 Web API + EF Core + PostgreSQL
- [x] Environment variables for swappable storage/hosting
- [x] Serilog, base CI/CD (GitHub Actions)
- [x] Auth skeleton (JWT + refresh tokens + role seed)

**Artifacts:** `generio-docs/phases/PHASE_1.md`, `README.md`, `.env.example`, `.github/workflows/ci.yml`

**Note:** Docker Desktop was not running during setup — run `docker compose up -d` before first API migrate/seed.

### Phase 2 — Auth and CMS Shell ✅ Complete (2026-07-14)

- [x] Admin login
- [x] Roles and permissions
- [x] Dashboard shell, sidebar, site settings
- [x] Audit logging basics

**Artifacts:** `generio-docs/phases/PHASE_2.md`, `/admin/*` routes, `/api/admin/*` endpoints, `Phase2CmsShell` migration

**Local:** http://localhost:3000/admin/login · API http://localhost:5080 · Postgres host port **5433**

### Phase 3 — Domain APIs (English content model) ✅ Complete (2026-07-14)

- [x] Pages / sections
- [x] Services
- [x] Industries
- [x] Markets / regions (map data)
- [x] Partner network
- [x] Testimonials / success stories
- [x] SEO metadata
- [x] Media metadata
- [x] Single contact enquiry API (with EnquiryType)

**Artifacts:** `generio-docs/phases/PHASE_3.md`, `/api/public/*`, `/api/admin` content CRUD, `Phase3DomainContent` migration + Generio seed

### Phase 4 — Public Site Foundation (English) ✅ Complete (2026-07-14)

- [x] Header, footer, navigation
- [x] Design system and responsive layout
- [x] English routing (Arabic locale deferred)
- [x] Shared section components

**Artifacts:** `generio-docs/phases/PHASE_4.md`, `src/app/(public)/*`, `src/components/public/*`

### Phase 5 — Home and Core Marketing Pages ✅ Complete (2026-07-14)

- [x] Home sections polish (editorial / full-bleed, not Bootstrap cards)
- [x] About Generio
- [x] Services listing + detail refinement
- [x] Industries / Partners / Success Stories polish
- [x] Legal pages consume shared section system
- [x] Generio content only

**Artifacts:** `generio-docs/phases/PHASE_5.md`, redesigned `sections.tsx`, header/footer, `Reveal.tsx`

### Phase 6 — Interactive Regional Coverage Map ✅ Complete (2026-07-14)

- [x] Map UI (desktop + mobile fallback list)
- [x] Region/country CMS data binding
- [x] Tooltips, detail panel, accessibility
- [x] Markets We Cover page as primary map experience

**Artifacts:** `generio-docs/phases/PHASE_6.md`, `CoverageMap.tsx`, dedicated `/markets` page

### Phase 7 — CMS Content Modules ✅ Complete (2026-07-14)

- [x] CRUD UIs for pages, sections, services, industries, markets, partners, testimonials
- [x] Footer/CTA via Site Settings; publishing workflow for pages/stories
- [x] TipTap where rich text is needed
- [x] Media metadata + picker stub (upload deferred to Phase 8)

**Artifacts:** `generio-docs/phases/PHASE_7.md`, admin content routes under `/admin/*`

### Phase 8 — Media and SEO (English) ✅ Complete (2026-07-14)

- [x] Media library + local storage adapter (cloud providers stubbed)
- [x] Image processing (WebP + max-edge resize)
- [x] SEO management, sitemap, robots, redirects
- [x] Publish English content end-to-end via CMS media + SEO

**Artifacts:** `generio-docs/phases/PHASE_8.md`, `/admin/media`, `/admin/seo`, `sitemap.ts`, `robots.ts`

### Phase 9 — Single Contact Form and Notifications ✅ Complete (2026-07-14)

- [x] One public contact form (EnquiryType dropdown)
- [x] CAPTCHA (optional Turnstile), rate limiting, honeypot spam protection
- [x] CMS enquiry inbox, assignment, statuses, CSV export
- [x] Email notifications (Console/Smtp); WhatsApp stub

**Artifacts:** `generio-docs/phases/PHASE_9.md`, `ContactForm.tsx`, `/admin/enquiries`

### Phase 10 — English MVP Launch

- Functional, responsive, browser, security, performance, a11y testing
- Choose production stack from open cloud options
- Deploy, SSL, DNS, monitoring, backups
- Admin training

### Phase 11 — Arabic and Expansion (post-MVP)

- Arabic locale + RTL
- CMS translation workflows
- hreflang and language-specific SEO
- Optional CRM integrations, campaign landing pages, extra languages

---

## 20. Final Outcome

GENERIO Trading FZCO will receive a modern, scalable, CMS-enabled corporate website built with Next.js, React, TypeScript, and ASP.NET Core.

**MVP (English):**

- Merged Generio information architecture (markets, industries, partner network)
- Interactive regional coverage map
- One contact / enquiry form for all visitor types
- CMS for pages, sections, services, industries, markets, partners, testimonials, media, SEO, users/roles
- Content and media sourced only from Generio — not from other sites
- Deployment-ready against any listed frontend, API, database, and storage option

**Later:**

- Arabic (RTL) and additional languages
- Deeper GCC / CRM / campaign integrations

The architecture supports future expansion without rewriting the public site or CMS core.
