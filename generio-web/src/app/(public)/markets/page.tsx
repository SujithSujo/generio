import type { Metadata } from "next";
import Link from "next/link";
import { CoverageMap } from "@/components/public/CoverageMap";
import { Reveal } from "@/components/public/Reveal";
import { loadPublicPageData } from "@/lib/load-public-page";
import { buildPageMetadata } from "@/lib/seo-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await loadPublicPageData("markets");
  return buildPageMetadata(
    page,
    "Markets We Cover",
    "Explore Generio’s interactive regional coverage across emerging markets.",
  );
}

export default async function MarketsPage() {
  const { page, context } = await loadPublicPageData("markets");
  const intro =
    page?.sections.find((s) => s.sectionType === "markets_map")?.description ??
    "Explore Generio’s geographic coverage by region and market — curated for brand expansion across emerging economies.";

  return (
    <main className="pt-[var(--header-h)]">
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="site-atmosphere absolute inset-0" />
        <div className="site-grain absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--brand-primary)]">
              Markets we cover
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.5rem,6vw,4.6rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-[var(--ink)]">
              {page?.title ?? "Interactive regional coverage"}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--ink-muted)]">{intro}</p>
          </Reveal>
          <Reveal delayMs={120}>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-[var(--ink-muted)]">
              <span>
                <strong className="font-semibold text-[var(--ink)]">{context.markets.length}</strong> regions
              </span>
              <span>
                <strong className="font-semibold text-[var(--ink)]">
                  {context.markets.reduce((sum, region) => sum + region.countries.length, 0)}
                </strong>{" "}
                markets
              </span>
              <Link href="/contact" className="font-semibold text-[var(--brand-deep)] hover:underline">
                Discuss a market →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--surface-muted)] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <CoverageMap regions={context.markets} />
          </Reveal>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <Reveal>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--brand-primary)]">
              How we work markets
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
              From Dubai to multi-region growth
            </h2>
          </Reveal>
          <Reveal delayMs={100}>
            <div className="space-y-5 text-base leading-8 text-[var(--ink-muted)]">
              <p>
                Generio helps manufacturers and brand owners enter and expand across the GCC, Levant & Iraq,
                South & Central Asia, Africa, and Iran & neighboring markets.
              </p>
              <p>
                Coverage is managed as a living network of distributors, importers, and retail partners —
                selected, negotiated, and monitored for sustainable growth.
              </p>
              <Link
                href="/contact"
                className="link-sheen inline-flex rounded-full bg-[var(--brand-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-primary-dark)]"
              >
                Talk market entry
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
