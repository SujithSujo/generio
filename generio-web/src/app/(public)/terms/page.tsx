import { CmsPage, cmsMetadata } from "@/components/public/CmsPage";

export const generateMetadata = cmsMetadata("terms", "Terms and Conditions");

export default function TermsPage() {
  return <CmsPage slug="terms" fallbackTitle="Terms and Conditions" />;
}
