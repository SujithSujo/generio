import { apiFetch } from "./api-client";

export const SECTION_TYPES = [
  "hero",
  "introduction",
  "value_props",
  "statistics",
  "services",
  "markets_map",
  "industries",
  "partners",
  "success_stories",
  "contact_cta",
  "contact_form",
  "rich_text",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export type AdminPageListItem = {
  id: string;
  name: string;
  slug: string;
  title: string;
  pageType: string | null;
  status: string;
  isPublished: boolean;
  updatedAt: string;
  sectionCount: number;
};

export type AdminPageSection = {
  id: string;
  pageId: string;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  contentJson: string | null;
  backgroundImageId: string | null;
  displayOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminPageDetail = {
  id: string;
  name: string;
  slug: string;
  title: string;
  pageType: string | null;
  status: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sections: AdminPageSection[];
};

export type UpsertPagePayload = {
  name: string;
  slug?: string | null;
  title: string;
  pageType?: string | null;
  isPublished: boolean;
};

export type SectionPayload = {
  id?: string | null;
  sectionType: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  contentJson?: string | null;
  backgroundImageId?: string | null;
  displayOrder: number;
  isVisible: boolean;
};

export type AdminService = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  bulletPointsJson: string | null;
  icon: string | null;
  featuredImageId: string | null;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertServicePayload = {
  title: string;
  slug?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  bulletPointsJson?: string | null;
  icon?: string | null;
  featuredImageId?: string | null;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type AdminIndustry = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  icon: string | null;
  imageId: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpsertIndustryPayload = {
  name: string;
  slug?: string | null;
  shortDescription?: string | null;
  icon?: string | null;
  imageId?: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type AdminCountry = {
  id: string;
  marketRegionId: string;
  name: string;
  isoCode: string | null;
  latitude: number | null;
  longitude: number | null;
  shortDescription: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type AdminMarketRegion = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  highlightColor: string | null;
  boundaryJson: string | null;
  centroidLat: number | null;
  centroidLng: number | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  countries: AdminCountry[];
};

export type UpsertMarketRegionPayload = {
  name: string;
  slug?: string | null;
  description?: string | null;
  highlightColor?: string | null;
  boundaryJson?: string | null;
  centroidLat?: number | null;
  centroidLng?: number | null;
  displayOrder: number;
  isActive: boolean;
};

export type CountryPayload = {
  id?: string | null;
  name: string;
  isoCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  shortDescription?: string | null;
  displayOrder: number;
  isActive: boolean;
};

export type AdminPartner = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  shortDescription: string | null;
  websiteUrl: string | null;
  logoMediaId: string | null;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpsertPartnerPayload = {
  name: string;
  slug?: string | null;
  category?: string | null;
  shortDescription?: string | null;
  websiteUrl?: string | null;
  logoMediaId?: string | null;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
};

export type AdminStory = {
  id: string;
  personName: string | null;
  designation: string | null;
  companyName: string | null;
  storyText: string;
  personImageId: string | null;
  companyLogoId: string | null;
  rating: number | null;
  displayOrder: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpsertStoryPayload = {
  personName?: string | null;
  designation?: string | null;
  companyName?: string | null;
  storyText: string;
  personImageId?: string | null;
  companyLogoId?: string | null;
  rating?: number | null;
  displayOrder: number;
  isActive: boolean;
  isPublished: boolean;
};

export type AdminMedia = {
  id: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  storageProvider: string | null;
  storagePath: string;
  publicUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  fileSize: number;
  isDeleted: boolean;
  uploadedByUserId?: string | null;
  createdAt: string;
};

export type UpsertMediaPayload = {
  fileName: string;
  originalFileName: string;
  mimeType: string;
  storageProvider?: string | null;
  storagePath: string;
  publicUrl?: string | null;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
  fileSize: number;
};

export type AdminSeo = {
  id: string;
  entityType: string;
  entityId: string;
  languageCode: string;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  openGraphTitle: string | null;
  openGraphDescription: string | null;
  openGraphImageId: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  structuredDataJson: string | null;
  updatedAt: string;
};

export type UpsertSeoPayload = {
  entityType: string;
  entityId: string;
  languageCode?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  openGraphTitle?: string | null;
  openGraphDescription?: string | null;
  openGraphImageId?: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  structuredDataJson?: string | null;
};

export type AdminRedirect = {
  id: string;
  fromPath: string;
  toUrl: string;
  isPermanent: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpsertRedirectPayload = {
  fromPath: string;
  toUrl: string;
  isPermanent: boolean;
  isActive: boolean;
};

function auth(accessToken: string) {
  return { accessToken };
}

export function fetchAdminPages(accessToken: string) {
  return apiFetch<AdminPageListItem[]>("/api/admin/pages", auth(accessToken));
}

export function fetchAdminPage(accessToken: string, id: string) {
  return apiFetch<AdminPageDetail>(`/api/admin/pages/${id}`, auth(accessToken));
}

export function createAdminPage(accessToken: string, payload: UpsertPagePayload) {
  return apiFetch<AdminPageDetail>("/api/admin/pages", {
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function updateAdminPage(accessToken: string, id: string, payload: UpsertPagePayload) {
  return apiFetch<AdminPageDetail>(`/api/admin/pages/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function updateAdminPageSections(accessToken: string, pageId: string, sections: SectionPayload[]) {
  return apiFetch<AdminPageDetail>(`/api/admin/pages/${pageId}/sections`, {
    method: "PUT",
    body: JSON.stringify({ sections }),
    ...auth(accessToken),
  });
}

export function fetchAdminServices(accessToken: string) {
  return apiFetch<AdminService[]>("/api/admin/services", auth(accessToken));
}

export function createAdminService(accessToken: string, payload: UpsertServicePayload) {
  return apiFetch<AdminService>("/api/admin/services", {
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function updateAdminService(accessToken: string, id: string, payload: UpsertServicePayload) {
  return apiFetch<AdminService>(`/api/admin/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function deactivateAdminService(accessToken: string, id: string) {
  return apiFetch<void>(`/api/admin/services/${id}`, {
    method: "DELETE",
    ...auth(accessToken),
  });
}

export function fetchAdminIndustries(accessToken: string) {
  return apiFetch<AdminIndustry[]>("/api/admin/industries", auth(accessToken));
}

export function createAdminIndustry(accessToken: string, payload: UpsertIndustryPayload) {
  return apiFetch<AdminIndustry>("/api/admin/industries", {
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function updateAdminIndustry(accessToken: string, id: string, payload: UpsertIndustryPayload) {
  return apiFetch<AdminIndustry>(`/api/admin/industries/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function fetchAdminMarkets(accessToken: string) {
  return apiFetch<AdminMarketRegion[]>("/api/admin/markets", auth(accessToken));
}

export function createAdminMarketRegion(accessToken: string, payload: UpsertMarketRegionPayload) {
  return apiFetch<AdminMarketRegion>("/api/admin/markets/regions", {
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function updateAdminMarketRegion(accessToken: string, id: string, payload: UpsertMarketRegionPayload) {
  return apiFetch<AdminMarketRegion>(`/api/admin/markets/regions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function updateAdminMarketCountries(accessToken: string, regionId: string, countries: CountryPayload[]) {
  return apiFetch<AdminMarketRegion>(`/api/admin/markets/regions/${regionId}/countries`, {
    method: "PUT",
    body: JSON.stringify({ countries }),
    ...auth(accessToken),
  });
}

export function fetchAdminPartners(accessToken: string) {
  return apiFetch<AdminPartner[]>("/api/admin/partners", auth(accessToken));
}

export function createAdminPartner(accessToken: string, payload: UpsertPartnerPayload) {
  return apiFetch<AdminPartner>("/api/admin/partners", {
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function updateAdminPartner(accessToken: string, id: string, payload: UpsertPartnerPayload) {
  return apiFetch<AdminPartner>(`/api/admin/partners/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function fetchAdminStories(accessToken: string) {
  return apiFetch<AdminStory[]>("/api/admin/success-stories", auth(accessToken));
}

export type AdminEnquiry = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  enquiryType: string;
  subject: string;
  message: string;
  serviceId: string | null;
  status: string;
  internalRemarks: string | null;
  assignedToUserId: string | null;
  submittedAt: string;
  ipAddress: string | null;
};

export type UpdateEnquiryPayload = {
  status?: string | null;
  internalRemarks?: string | null;
  assignedToUserId?: string | null;
};

export function fetchAdminEnquiries(accessToken: string, filters?: { status?: string; enquiryType?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.enquiryType) params.set("enquiryType", filters.enquiryType);
  const query = params.toString();
  return apiFetch<AdminEnquiry[]>(`/api/admin/enquiries${query ? `?${query}` : ""}`, auth(accessToken));
}

export function updateAdminEnquiry(accessToken: string, id: string, payload: UpdateEnquiryPayload) {
  return apiFetch<AdminEnquiry>(`/api/admin/enquiries/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function exportAdminEnquiriesUrl(accessToken: string, filters?: { status?: string; enquiryType?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.enquiryType) params.set("enquiryType", filters.enquiryType);
  const query = params.toString();
  return { url: `/api/admin/enquiries/export${query ? `?${query}` : ""}`, accessToken };
}

export function createAdminStory(accessToken: string, payload: UpsertStoryPayload) {
  return apiFetch<AdminStory>("/api/admin/success-stories", {
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function updateAdminStory(accessToken: string, id: string, payload: UpsertStoryPayload) {
  return apiFetch<AdminStory>(`/api/admin/success-stories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function fetchAdminMedia(accessToken: string) {
  return apiFetch<AdminMedia[]>("/api/admin/media", auth(accessToken));
}

export function createAdminMedia(accessToken: string, payload: UpsertMediaPayload) {
  return apiFetch<AdminMedia>("/api/admin/media", {
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function uploadAdminMedia(accessToken: string, file: File, altText?: string) {
  const form = new FormData();
  form.append("file", file);
  if (altText) form.append("altText", altText);
  return apiFetch<AdminMedia>("/api/admin/media/upload", {
    method: "POST",
    body: form,
    ...auth(accessToken),
  });
}

export function updateAdminMedia(accessToken: string, id: string, payload: UpsertMediaPayload) {
  return apiFetch<AdminMedia>(`/api/admin/media/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function deleteAdminMedia(accessToken: string, id: string) {
  return apiFetch<void>(`/api/admin/media/${id}`, {
    method: "DELETE",
    ...auth(accessToken),
  });
}

export function fetchAdminSeo(accessToken: string, entityType?: string) {
  const query = entityType ? `?entityType=${encodeURIComponent(entityType)}` : "";
  return apiFetch<AdminSeo[]>(`/api/admin/seo${query}`, auth(accessToken));
}

export function upsertAdminSeo(accessToken: string, payload: UpsertSeoPayload) {
  return apiFetch<AdminSeo>("/api/admin/seo", {
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function fetchAdminRedirects(accessToken: string) {
  return apiFetch<AdminRedirect[]>("/api/admin/redirects", auth(accessToken));
}

export function createAdminRedirect(accessToken: string, payload: UpsertRedirectPayload) {
  return apiFetch<AdminRedirect>("/api/admin/redirects", {
    method: "POST",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function updateAdminRedirect(accessToken: string, id: string, payload: UpsertRedirectPayload) {
  return apiFetch<AdminRedirect>(`/api/admin/redirects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    ...auth(accessToken),
  });
}

export function deleteAdminRedirect(accessToken: string, id: string) {
  return apiFetch<void>(`/api/admin/redirects/${id}`, {
    method: "DELETE",
    ...auth(accessToken),
  });
}

export function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: string }).message);
    try {
      const parsed = JSON.parse(message) as { message?: string };
      if (parsed.message) return parsed.message;
    } catch {
      /* plain text */
    }
    if (message) return message;
  }
  return fallback;
}
