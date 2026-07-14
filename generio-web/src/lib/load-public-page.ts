import {
  getIndustries,
  getMarkets,
  getPageBySlug,
  getPartners,
  getServices,
  getSiteSettings,
  getSuccessStories,
} from "@/lib/public-api";

export async function loadPublicPageData(slug: string) {
  const [settings, page, services, industries, markets, partners, stories] = await Promise.all([
    getSiteSettings(),
    getPageBySlug(slug),
    getServices(),
    getIndustries(),
    getMarkets(),
    getPartners(),
    getSuccessStories(),
  ]);

  return {
    settings,
    page,
    context: { settings, services, industries, markets, partners, stories },
  };
}
