import { CmsPage, cmsMetadata } from "@/components/public/CmsPage";

export const generateMetadata = cmsMetadata("about", "About Generio");

export default function AboutPage() {
  return <CmsPage slug="about" fallbackTitle="About Generio" />;
}
