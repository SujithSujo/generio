import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { getSiteSettings, getSuccessStories } from "@/lib/public-api";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, stories] = await Promise.all([getSiteSettings(), getSuccessStories()]);
  const showSuccessStories = stories.length > 0;

  return (
    <>
      <SiteHeader
        companyName={settings["company.name"] ?? "Generio Trading FZCO"}
        ctaLabel={settings["site.primaryCtaLabel"] ?? "Contact Us"}
        ctaHref={settings["site.primaryCtaUrl"] ?? "/contact"}
        showSuccessStories={showSuccessStories}
      />
      <div className="flex-1">{children}</div>
      <SiteFooter
        companyName={settings["company.name"] ?? "Generio Trading FZCO"}
        tagline={settings["company.tagline"] ?? "Your Gateway to Emerging Markets"}
        email={settings["company.email"] ?? "info@generiogroup.com"}
        phone={settings["company.phone"] ?? "+971 50 110 6237"}
        whatsapp={settings["company.whatsapp"] ?? "+971 50 110 6237"}
        address={settings["company.address"] ?? "Dubai, United Arab Emirates"}
        showSuccessStories={showSuccessStories}
      />
    </>
  );
}
