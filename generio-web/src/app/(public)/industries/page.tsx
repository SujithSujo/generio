import { CmsPage, cmsMetadata } from "@/components/public/CmsPage";

export const generateMetadata = cmsMetadata("industries", "Industries");

export default function IndustriesPage() {
  return <CmsPage slug="industries" fallbackTitle="Industries" />;
}
