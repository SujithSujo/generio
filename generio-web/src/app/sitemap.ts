import type { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/api-client";

type SitemapResponse = {
  urls: Array<{ loc: string; lastmod?: string; priority?: number }>;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/sitemap`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error("sitemap api failed");
    const data = (await response.json()) as SitemapResponse;
    return data.urls.map((entry) => ({
      url: entry.loc,
      lastModified: entry.lastmod ? new Date(entry.lastmod) : new Date(),
      changeFrequency: "weekly",
      priority: entry.priority ?? 0.5,
    }));
  } catch {
    const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    return [
      { url: `${site}/`, priority: 1 },
      { url: `${site}/about`, priority: 0.7 },
      { url: `${site}/services`, priority: 0.7 },
      { url: `${site}/markets`, priority: 0.7 },
      { url: `${site}/contact`, priority: 0.6 },
    ];
  }
}
