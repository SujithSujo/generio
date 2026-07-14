import type { Metadata } from "next";
import type { PublicPage } from "@/lib/public-api";

export function buildPageMetadata(
  page: PublicPage | null | undefined,
  fallbackTitle: string,
  fallbackDescription?: string,
): Metadata {
  const seo = page?.seo;
  const title = seo?.seoTitle ?? page?.title ?? fallbackTitle;
  const description = seo?.metaDescription ?? fallbackDescription;
  const robotsIndex = seo?.robotsIndex ?? true;
  const robotsFollow = seo?.robotsFollow ?? true;
  const ogTitle = seo?.openGraphTitle ?? title;
  const ogDescription = seo?.openGraphDescription ?? description;
  const ogImage = seo?.openGraphImageUrl ?? undefined;

  return {
    title,
    description: description ?? undefined,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
    },
    openGraph: {
      title: ogTitle ?? undefined,
      description: ogDescription ?? undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: "website",
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle ?? undefined,
      description: ogDescription ?? undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
