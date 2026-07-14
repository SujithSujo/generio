import { CmsPage, cmsMetadata } from "@/components/public/CmsPage";

export const generateMetadata = cmsMetadata("cookie-policy", "Cookie Policy");

export default function CookiePolicyPage() {
  return <CmsPage slug="cookie-policy" fallbackTitle="Cookie Policy" />;
}
