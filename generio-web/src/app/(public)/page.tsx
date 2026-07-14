import type { Metadata } from "next";
import { PageSections } from "@/components/public/sections";
import { loadPublicPageData } from "@/lib/load-public-page";
import { buildPageMetadata } from "@/lib/seo-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await loadPublicPageData("home");
  return buildPageMetadata(
    page,
    "Generio Trading FZCO",
    "Your Gateway to Emerging Markets — Generio Trading FZCO.",
  );
}

export default async function HomePage() {
  const { page, context } = await loadPublicPageData("home");

  if (!page) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-[calc(var(--header-h)+4rem)] sm:px-6">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-[var(--ink)]">
          Generio Trading FZCO
        </h1>
        <p className="mt-4 text-lg text-[var(--ink-muted)]">
          Content is temporarily unavailable. Please ensure the API is running.
        </p>
      </main>
    );
  }

  return (
    <main>
      <PageSections sections={page.sections} context={context} />
    </main>
  );
}
