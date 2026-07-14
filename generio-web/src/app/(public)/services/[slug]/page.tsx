import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/public/Reveal";
import { apiFetch } from "@/lib/api-client";
import { parseBulletJson, type PublicService } from "@/lib/public-api";

type Props = { params: Promise<{ slug: string }> };

type ServiceDetail = PublicService & {
  fullDescription?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

async function getService(slug: string) {
  try {
    return await apiFetch<ServiceDetail>(`/api/public/services/${slug}`, {
      next: { revalidate: 300 },
    } as RequestInit);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  return {
    title: service?.seoTitle ?? service?.title ?? "Service",
    description: service?.seoDescription ?? service?.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const bullets = parseBulletJson(service.bulletPointsJson);

  return (
    <main className="pt-[var(--header-h)]">
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="site-atmosphere absolute inset-0" />
        <div className="site-grain absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <Reveal>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-deep)]"
            >
              <span>←</span> All services
            </Link>
          </Reveal>
          <Reveal delayMs={80}>
            <h1 className="mt-8 max-w-4xl font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--ink)]">
              {service.title}
            </h1>
          </Reveal>
          <Reveal delayMs={140}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-[var(--ink-muted)]">
              {service.shortDescription}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <Reveal>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--brand-primary)]">
            Overview
          </p>
          <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
            {service.fullDescription ?? service.shortDescription}
          </p>
          <Link
            href="/contact"
            className="link-sheen mt-10 inline-flex rounded-full bg-[var(--brand-primary)] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[var(--brand-primary-dark)]"
          >
            Discuss this service
          </Link>
        </Reveal>

        <Reveal delayMs={120}>
          <div className="border-t border-[var(--border)] pt-2">
            <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--brand-primary)]">
              Included focus
            </p>
            <ul className="divide-y divide-[var(--border)]">
              {bullets.map((item, index) => (
                <li key={item} className="flex gap-4 py-5">
                  <span className="font-display text-sm font-semibold tracking-[0.18em] text-[var(--brand-primary)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base leading-relaxed text-[var(--ink)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
