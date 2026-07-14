import { CmsPage, cmsMetadata } from "@/components/public/CmsPage";

export const generateMetadata = cmsMetadata("services", "Services");

export default function ServicesPage() {
  return <CmsPage slug="services" fallbackTitle="Services" />;
}
