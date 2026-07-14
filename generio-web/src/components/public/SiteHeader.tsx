"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNav } from "@/lib/nav";

type HeaderProps = {
  companyName: string;
  ctaLabel: string;
  ctaHref: string;
  showSuccessStories: boolean;
};

export function SiteHeader({
  companyName,
  ctaLabel,
  ctaHref,
  showSuccessStories,
}: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = primaryNav.filter((item) => {
    if ("hideIfEmpty" in item && item.hideIfEmpty === "stories") {
      return showSuccessStories;
    }
    return true;
  });

  const solid = scrolled || open || !isHome;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-500 ${
        solid
          ? "border-b border-[var(--border)] bg-white/88 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="relative z-10 flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/brand/generio-logo.jpeg"
            alt={companyName}
            width={150}
            height={78}
            className="h-11 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center xl:flex">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                className={`nav-link px-3 py-2 text-[0.82rem] font-medium tracking-wide transition ${
                  active ? "text-[var(--ink)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={ctaHref}
            className="link-sheen hidden rounded-full bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-primary-dark)] sm:inline-flex"
          >
            {ctaLabel}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white/80 text-[var(--ink)] xl:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex w-4 flex-col gap-1.5">
              <span className={`h-px w-full bg-current transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`h-px w-full bg-current transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[var(--border)] bg-white px-4 py-5 xl:hidden">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 text-base font-medium text-[var(--ink)] hover:bg-[var(--surface-muted)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={ctaHref}
              className="mt-3 rounded-full bg-[var(--brand-primary)] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              {ctaLabel}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
