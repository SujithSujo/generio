import type { Metadata } from "next";
import Link from "next/link";
import { PageSections } from "@/components/public/sections";
import { loadPublicPageData } from "@/lib/load-public-page";
import { buildPageMetadata } from "@/lib/seo-metadata";

type CmsPageProps = {
  slug: string;
  fallbackTitle: string;
};

export async function CmsPage({ slug, fallbackTitle }: CmsPageProps) {
  const { page, context } = await loadPublicPageData(slug);
  const hasHero = page?.sections.some((section) => section.sectionType === "hero");

  if (!page) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-[calc(var(--header-h)+3rem)] sm:px-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--ink)]">{fallbackTitle}</h1>
        <p className="mt-4 text-lg text-[var(--ink-muted)]">This page will appear once content is published.</p>
        <Link href="/" className="mt-8 inline-flex text-sm font-semibold text-[var(--brand-primary)]">
          Back to home →
        </Link>
      </main>
    );
  }

  return (
    <main className={hasHero ? undefined : "pt-[var(--header-h)]"}>
      {page.seo?.structuredDataJson ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: page.seo.structuredDataJson }}
        />
      ) : null}
      <PageSections sections={page.sections} context={context} />
    </main>
  );
}

export function cmsMetadata(slug: string, fallbackTitle: string) {
  return async function generateMetadata(): Promise<Metadata> {
    const { page } = await loadPublicPageData(slug);
    return buildPageMetadata(page, fallbackTitle);
  };
}
