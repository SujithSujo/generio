import { CmsPage, cmsMetadata } from "@/components/public/CmsPage";

export const generateMetadata = cmsMetadata("partners", "Partner Network");

export default function PartnersPage() {
  return <CmsPage slug="partners" fallbackTitle="Partner Network" />;
}
