# Phase 9 — Single Contact Form and Notifications

**Status:** Complete  
**Date:** 2026-07-14  

---

## Objectives

- One public contact form with EnquiryType dropdown  
- CAPTCHA (optional), rate limiting, honeypot spam protection  
- CMS enquiry inbox with assignment, statuses, CSV export  
- Email notifications + WhatsApp stub  

---

## Deliverables

| Item | Location |
|------|----------|
| Public contact form | `ContactForm.tsx` on `contact_form` sections |
| Public APIs | `POST /api/public/enquiries`, `GET /api/public/contact-config` |
| Rate limit | 5 posts / 10 min / IP (`enquiries` policy) |
| Honeypot | Hidden `website` field → `Spam` status, no notify |
| CAPTCHA | Turnstile verifier; disabled locally via `Captcha:Enabled=false` |
| Email | `IEmailSender` Console (default) or Smtp |
| WhatsApp | `IWhatsAppNotifier` logging stub |
| Admin inbox | `/admin/enquiries` |
| CSV export | `GET /api/admin/enquiries/export` |
| Dashboard counters | Enquiries / New enquiries |

### Config (`appsettings.json`)

```json
Captcha.Enabled=false
Email.Provider=Console|Smtp
Email.NotifyTo=info@generiogroup.com
WhatsApp.Enabled=false
```

---

## Verification

- [x] `/contact` renders live form  
- [x] Submit → admin inbox + console email log  
- [x] Status / assign / export  
- [x] Lint / build  

**Phase 9 complete → ready for Phase 10 (English MVP Launch).**
