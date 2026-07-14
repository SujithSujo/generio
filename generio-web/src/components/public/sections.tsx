import Link from "next/link";
import type {
  MarketRegion,
  PageSection,
  PublicIndustry,
  PublicPartner,
  PublicService,
  PublicStory,
} from "@/lib/public-api";
import { parseBulletJson } from "@/lib/public-api";
import { ContactForm } from "@/components/public/ContactForm";
import { Reveal } from "@/components/public/Reveal";

export type SectionContext = {
  services: PublicService[];
  industries: PublicIndustry[];
  markets: MarketRegion[];
  partners: PublicPartner[];
  stories: PublicStory[];
  settings: Record<string, string>;
};

const COMPANY_INTRO = `Generio Trading FZCO is a Dubai-based business development and market expansion company that helps manufacturers and brand owners establish successful distribution networks across the Middle East, Africa, South Asia, and other emerging markets.

With an extensive network of distributors, importers, wholesalers, and retail partners, Generio identifies, evaluates, and connects brands with the right local partners to accelerate market entry and sustainable growth.`;

function Container({
  children,
  className = "",
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={`mx-auto w-full ${wide ? "max-w-7xl" : "max-w-6xl"} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--brand-primary)]">
      {children}
    </p>
  );
}

function HeroRoutes() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-70"
      viewBox="0 0 1440 900"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <circle className="hero-orb" cx="1120" cy="220" r="180" fill="url(#orbA)" />
      <circle className="hero-orb" cx="280" cy="620" r="240" fill="url(#orbB)" style={{ animationDelay: "-4s" }} />
      <path
        className="route-path"
        d="M120 640 C 320 500, 420 420, 620 390 S 980 360, 1180 250"
        stroke="url(#route)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        className="route-path"
        d="M180 720 C 400 640, 560 560, 760 520 S 1080 470, 1320 380"
        stroke="url(#route)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
        style={{ animationDelay: "0.35s" }}
      />
      <circle cx="620" cy="390" r="5" fill="#1B9DD9" />
      <circle cx="980" cy="330" r="4" fill="#0B4F6C" />
      <circle cx="1180" cy="250" r="6" fill="#1B9DD9" />
      <defs>
        <radialGradient id="orbA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1120 220) rotate(90) scale(180)">
          <stop stopColor="#1B9DD9" stopOpacity="0.35" />
          <stop offset="1" stopColor="#1B9DD9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="orbB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(280 620) rotate(90) scale(240)">
          <stop stopColor="#0B4F6C" stopOpacity="0.22" />
          <stop offset="1" stopColor="#0B4F6C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="route" x1="120" y1="640" x2="1180" y2="250" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1B9DD9" stopOpacity="0" />
          <stop offset="0.35" stopColor="#1B9DD9" />
          <stop offset="1" stopColor="#0B4F6C" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function HeroSection({
  section,
  settings,
}: {
  section: PageSection;
  settings: Record<string, string>;
}) {
  const brand = settings["company.name"] ?? "Generio Trading FZCO";
  const headline =
    section.title ?? settings["company.tagline"] ?? "Your Gateway to Emerging Markets";
  const support =
    section.description ??
    "Helping manufacturers and brand owners build lasting distribution networks across emerging markets.";

  return (
    <section className="relative isolate min-h-[min(92vh,920px)] overflow-hidden border-b border-[var(--border)]">
      <div className="site-atmosphere absolute inset-0" />
      <div className="site-grain absolute inset-0" />
      <HeroRoutes />
      <Container className="relative flex min-h-[min(92vh,920px)] flex-col justify-end pb-16 pt-[calc(var(--header-h)+3rem)] sm:pb-20 lg:pb-24">
        <div className="max-w-4xl">
          <p className="animate-fade-up font-display text-2xl font-semibold tracking-tight text-[var(--brand-deep)] sm:text-3xl md:text-4xl">
            {brand}
          </p>
          <h1 className="animate-fade-up-delayed mt-5 font-display text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-[var(--ink)]">
            {headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink-muted)] sm:text-xl [animation:fade-up_0.9s_ease_0.28s_both]">
            {support}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4 [animation:fade-up_0.9s_ease_0.4s_both]">
            <Link
              href={settings["site.primaryCtaUrl"] ?? "/contact"}
              className="link-sheen inline-flex items-center rounded-full bg-[var(--brand-primary)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-dark)]"
            >
              {settings["site.primaryCtaLabel"] ?? "Contact Us"}
            </Link>
            <Link
              href="/markets"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink)]"
            >
              Explore markets
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function IntroductionSection({ section }: { section: PageSection }) {
  const body = section.description?.trim() || COMPANY_INTRO;
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(body);

  return (
    <section className="border-b border-[var(--border)] bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <SectionLabel>About Generio</SectionLabel>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
              {section.title ?? "Built for market expansion"}
            </h2>
          </Reveal>
          <div className="space-y-6">
            {isHtml ? (
              <Reveal>
                <div
                  className="prose prose-lg max-w-none text-[var(--ink-muted)] prose-p:leading-8"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              </Reveal>
            ) : (
              body.split(/\n\n+/).map((paragraph, index) => (
                <Reveal key={`${index}-${paragraph.slice(0, 24)}`} delayMs={index * 80}>
                  <p className="text-lg leading-8 text-[var(--ink-muted)]">{paragraph}</p>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function ValuePropsSection({ section }: { section: PageSection }) {
  const items = parseBulletJson(section.contentJson);
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface-muted)] py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionLabel>Why Generio</SectionLabel>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
            {section.title ?? "Why brands choose Generio"}
          </h2>
        </Reveal>
        <ol className="mt-14 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {items.map((item, index) => (
            <Reveal key={item} delayMs={index * 60}>
              <li className="grid gap-4 py-7 md:grid-cols-[5rem_1fr] md:items-baseline">
                <span className="font-display text-sm font-semibold tracking-[0.2em] text-[var(--brand-primary)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-xl leading-relaxed text-[var(--ink)] md:text-2xl">{item}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function ServicesSection({
  section,
  services,
}: {
  section: PageSection;
  services: PublicService[];
}) {
  return (
    <section className="border-b border-[var(--border)] bg-white py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionLabel>Capabilities</SectionLabel>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
              {section.title ?? "What we do"}
            </h2>
            {section.description ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--ink-muted)]">{section.description}</p>
            ) : null}
          </Reveal>
          <Reveal delayMs={100}>
            <Link href="/services" className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-deep)]">
              View all services
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {services.map((service, index) => (
            <Reveal key={service.id} delayMs={index * 50}>
              <Link href={`/services/${service.slug}`} className="service-row group block py-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-10">
                  <div className="md:max-w-xl">
                    <div className="flex items-baseline gap-4">
                      <span className="text-xs font-semibold tracking-[0.22em] text-[var(--brand-primary)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)] transition group-hover:text-[var(--brand-deep)] sm:text-3xl">
                        {service.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)] md:pl-12">
                      {service.shortDescription}
                    </p>
                  </div>
                  <span className="md:pt-2 text-sm font-semibold text-[var(--brand-primary)] opacity-0 transition group-hover:opacity-100">
                    Explore →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function MarketsTeaserSection({
  section,
  markets,
}: {
  section: PageSection;
  markets: MarketRegion[];
}) {
  const totalCountries = markets.reduce((sum, region) => sum + region.countries.length, 0);

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--brand-deep)] py-20 text-white sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, rgba(27,157,217,0.45), transparent 35%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08), transparent 30%)",
        }}
      />
      <Container className="relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/70">
              Geographic reach
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {section.title ?? "Markets we cover"}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
              {section.description ??
                `${markets.length} regions and ${totalCountries} markets across emerging geographies.`}
            </p>
          </Reveal>
          <Reveal delayMs={120}>
            <Link
              href="/markets"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open interactive map
              <span>→</span>
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {markets.map((region, index) => (
            <Reveal key={region.id} delayMs={index * 70}>
              <div className="border-t border-white/20 pt-5">
                <div
                  className="mb-4 h-1 w-12 rounded-full"
                  style={{ background: region.highlightColor ?? "#1B9DD9" }}
                />
                <h3 className="font-display text-xl font-semibold">{region.name}</h3>
                <p className="mt-2 text-sm text-white/60">{region.countries.length} markets</p>
                <p className="mt-4 text-sm leading-relaxed text-white/75">
                  {region.countries
                    .slice(0, 3)
                    .map((c) => c.name)
                    .join(" · ")}
                  {region.countries.length > 3 ? "…" : ""}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function IndustriesSection({
  section,
  industries,
}: {
  section: PageSection;
  industries: PublicIndustry[];
}) {
  return (
    <section className="border-b border-[var(--border)] bg-white py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionLabel>Industries</SectionLabel>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
            {section.title ?? "Industries we serve"}
          </h2>
        </Reveal>
        <div className="mt-14 columns-1 gap-x-12 sm:columns-2 lg:columns-3">
          {industries.map((industry, index) => (
            <Reveal key={industry.id} delayMs={index * 40} className="mb-0 break-inside-avoid">
              <Link
                href="/industries"
                className="group flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-5"
              >
                <span className="font-display text-xl font-semibold text-[var(--ink)] transition group-hover:text-[var(--brand-deep)] sm:text-2xl">
                  {industry.name}
                </span>
                <span className="text-xs tracking-[0.18em] text-[var(--ink-muted)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function PartnersSection({
  section,
  partners,
}: {
  section: PageSection;
  partners: PublicPartner[];
}) {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface-muted)] py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionLabel>Network</SectionLabel>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
            {section.title ?? "Partner network"}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--ink-muted)]">
            {section.description ??
              "Generio works with distributors, importers, wholesalers, and retail partners across emerging markets. Featured partners appear here once published."}
          </p>
        </Reveal>
        {partners.length ? (
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {partners.map((partner, index) => (
              <Reveal key={partner.id} delayMs={index * 70}>
                <article className="border-t border-[var(--border)] pt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
                    {partner.category ?? "Partner"}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--ink)]">{partner.name}</h3>
                  {partner.shortDescription ? (
                    <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)]">{partner.shortDescription}</p>
                  ) : null}
                </article>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delayMs={100}>
            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {["Distributors", "Importers", "Retail partners"].map((label) => (
                <div key={label} className="border-t border-[var(--border)] pt-4">
                  <p className="font-display text-lg font-semibold text-[var(--ink)]">{label}</p>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">Across GCC, Levant, Asia & Africa</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}

export function SuccessStoriesSection({
  section,
  stories,
}: {
  section: PageSection;
  stories: PublicStory[];
}) {
  if (!stories.length) return null;
  return (
    <section className="border-b border-[var(--border)] bg-white py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionLabel>Proof</SectionLabel>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
            {section.title ?? "Success stories"}
          </h2>
        </Reveal>
        <div className="mt-14 space-y-12">
          {stories.map((story, index) => (
            <Reveal key={story.id} delayMs={index * 80}>
              <blockquote className="grid gap-6 border-l-2 border-[var(--brand-primary)] pl-6 md:grid-cols-[1fr_12rem]">
                <p className="font-display text-2xl leading-snug text-[var(--ink)] sm:text-3xl">
                  “{story.storyText}”
                </p>
                <footer className="text-sm leading-relaxed text-[var(--ink-muted)]">
                  {[story.personName, story.designation, story.companyName].filter(Boolean).join("\n")}
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function ContactCtaSection({
  section,
  settings,
}: {
  section: PageSection;
  settings: Record<string, string>;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] py-20 sm:py-28">
      <div className="site-atmosphere absolute inset-0" />
      <div className="site-grain absolute inset-0" />
      <Container className="relative">
        <Reveal>
          <div className="max-w-3xl">
            <SectionLabel>Next step</SectionLabel>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
              {section.title ?? "Start a conversation"}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--ink-muted)]">
              {section.description ??
                "One enquiry form for brand owners, distributors, and partners. Tell us where you want to grow."}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                href="/contact"
                className="link-sheen inline-flex rounded-full bg-[var(--brand-primary)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-dark)]"
              >
                {settings["site.primaryCtaLabel"] ?? "Contact Us"}
              </Link>
              <a
                href={`mailto:${settings["company.email"] ?? "info@generiogroup.com"}`}
                className="text-sm font-semibold text-[var(--ink)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--brand-primary)]"
              >
                {settings["company.email"] ?? "info@generiogroup.com"}
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function RichTextSection({ section }: { section: PageSection }) {
  return (
    <section className="border-b border-[var(--border)] bg-white py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            {section.title}
          </h2>
          {section.description ? (
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--ink-muted)]">{section.description}</p>
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}

export function PageSections({
  sections,
  context,
}: {
  sections: PageSection[];
  context: SectionContext;
}) {
  return (
    <>
      {sections.map((section) => {
        switch (section.sectionType) {
          case "hero":
            return <HeroSection key={section.id} section={section} settings={context.settings} />;
          case "introduction":
            return <IntroductionSection key={section.id} section={section} />;
          case "value_props":
            return <ValuePropsSection key={section.id} section={section} />;
          case "services":
            return <ServicesSection key={section.id} section={section} services={context.services} />;
          case "markets_map":
            return <MarketsTeaserSection key={section.id} section={section} markets={context.markets} />;
          case "industries":
            return <IndustriesSection key={section.id} section={section} industries={context.industries} />;
          case "partners":
            return <PartnersSection key={section.id} section={section} partners={context.partners} />;
          case "success_stories":
            return <SuccessStoriesSection key={section.id} section={section} stories={context.stories} />;
          case "contact_cta":
            return <ContactCtaSection key={section.id} section={section} settings={context.settings} />;
          case "contact_form":
            return (
              <ContactForm
                key={section.id}
                title={section.title}
                description={section.description}
              />
            );
          case "rich_text":
            return <RichTextSection key={section.id} section={section} />;
          case "statistics":
            return null;
          default:
            return <RichTextSection key={section.id} section={section} />;
        }
      })}
    </>
  );
}
