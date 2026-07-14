import { apiFetch } from "./api-client";

export type SiteSetting = { key: string; value: string };

export type PageSection = {
  id: string;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  contentJson: string | null;
  backgroundImageId: string | null;
  displayOrder: number;
};

export type PublicPage = {
  id: string;
  name: string;
  slug: string;
  title: string;
  pageType: string | null;
  sections: PageSection[];
  seo?: {
    seoTitle?: string | null;
    metaDescription?: string | null;
    canonicalUrl?: string | null;
    openGraphTitle?: string | null;
    openGraphDescription?: string | null;
    openGraphImageId?: string | null;
    openGraphImageUrl?: string | null;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    structuredDataJson?: string | null;
  } | null;
};

export type PublicService = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  bulletPointsJson?: string | null;
  icon?: string | null;
  isFeatured: boolean;
  displayOrder: number;
};

export type PublicIndustry = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  displayOrder: number;
};

export type MarketCountry = {
  id: string;
  name: string;
  isoCode: string | null;
  latitude: number | null;
  longitude: number | null;
  shortDescription: string | null;
  displayOrder: number;
};

export type MarketRegion = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  highlightColor: string | null;
  centroidLat: number | null;
  centroidLng: number | null;
  displayOrder: number;
  countries: MarketCountry[];
};

export type PublicPartner = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  shortDescription: string | null;
  isFeatured: boolean;
};

export type PublicStory = {
  id: string;
  personName: string | null;
  designation: string | null;
  companyName: string | null;
  storyText: string;
  rating: number | null;
};

function settingsMap(items: SiteSetting[]) {
  return Object.fromEntries(items.map((item) => [item.key, item.value]));
}

export async function getSiteSettings() {
  try {
    const items = await apiFetch<SiteSetting[]>("/api/public/site-settings", {
      next: { revalidate: 300 },
    } as RequestInit);
    return settingsMap(items);
  } catch {
    return {
      "company.name": "Generio Trading FZCO",
      "company.tagline": "Your Gateway to Emerging Markets",
      "company.email": "info@generiogroup.com",
      "company.phone": "+971 50 110 6237",
      "company.whatsapp": "+971 50 110 6237",
      "company.address": "Dubai, United Arab Emirates",
      "site.primaryCtaLabel": "Contact Us",
      "site.primaryCtaUrl": "/contact",
    } as Record<string, string>;
  }
}

export async function getPageBySlug(slug: string) {
  try {
    return await apiFetch<PublicPage>(`/api/public/pages/${slug}`, {
      next: { revalidate: 300 },
    } as RequestInit);
  } catch {
    return null;
  }
}

export async function getServices() {
  try {
    return await apiFetch<PublicService[]>("/api/public/services", {
      next: { revalidate: 300 },
    } as RequestInit);
  } catch {
    return [];
  }
}

export async function getIndustries() {
  try {
    return await apiFetch<PublicIndustry[]>("/api/public/industries", {
      next: { revalidate: 300 },
    } as RequestInit);
  } catch {
    return [];
  }
}

export async function getMarkets() {
  try {
    return await apiFetch<MarketRegion[]>("/api/public/markets", {
      next: { revalidate: 300 },
    } as RequestInit);
  } catch {
    return [];
  }
}

export async function getPartners() {
  try {
    return await apiFetch<PublicPartner[]>("/api/public/partners", {
      next: { revalidate: 300 },
    } as RequestInit);
  } catch {
    return [];
  }
}

export async function getSuccessStories() {
  try {
    return await apiFetch<PublicStory[]>("/api/public/success-stories", {
      next: { revalidate: 300 },
    } as RequestInit);
  } catch {
    return [];
  }
}

export type ContactConfig = {
  captchaEnabled: boolean;
  captchaProvider: string;
  captchaSiteKey: string | null;
  enquiryTypes: string[];
};

export type SubmitEnquiryPayload = {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  enquiryType: string;
  subject: string;
  message: string;
  serviceId?: string | null;
  consent: boolean;
  captchaToken?: string | null;
  website?: string | null;
};

export async function getContactConfig() {
  try {
    return await apiFetch<ContactConfig>("/api/public/contact-config", {
      cache: "no-store",
    } as RequestInit);
  } catch {
    return {
      captchaEnabled: false,
      captchaProvider: "Turnstile",
      captchaSiteKey: null,
      enquiryTypes: ["BrandOwner", "Distributor", "General", "Other"],
    } satisfies ContactConfig;
  }
}

export async function submitEnquiry(payload: SubmitEnquiryPayload) {
  return apiFetch<{ id: string; status: string; submittedAt: string }>("/api/public/enquiries", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      company: payload.company,
      enquiryType: payload.enquiryType,
      subject: payload.subject,
      message: payload.message,
      serviceId: payload.serviceId || null,
      consent: payload.consent,
      captchaToken: payload.captchaToken,
      website: payload.website,
    }),
  });
}

export function parseBulletJson(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
