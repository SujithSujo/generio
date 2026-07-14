import Link from "next/link";
import Image from "next/image";
import { footerQuickLinks, legalLinks } from "@/lib/nav";

type FooterProps = {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  showSuccessStories: boolean;
};

export function SiteFooter({
  companyName,
  tagline,
  email,
  phone,
  whatsapp,
  address,
  showSuccessStories,
}: FooterProps) {
  const whatsappHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
  const links = [
    ...footerQuickLinks,
    ...(showSuccessStories ? [{ href: "/success-stories", label: "Success Stories" }] : []),
  ];

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--ink)] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8 lg:py-20">
        <div>
          <div className="inline-flex rounded-xl bg-white px-3 py-2">
            <Image
              src="/brand/generio-logo.jpeg"
              alt={companyName}
              width={150}
              height={80}
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="mt-6 font-display text-2xl font-semibold tracking-tight">{companyName}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">{tagline}</p>
        </div>

        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
            Explore
          </p>
          <ul className="mt-5 space-y-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
            Contact
          </p>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            <li>{address}</li>
            <li>
              <a href={`mailto:${email}`} className="transition hover:text-white">
                {email}
              </a>
            </li>
            <li>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="transition hover:text-white">
                {phone}
              </a>
            </li>
            <li>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="transition hover:text-white">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-5">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
