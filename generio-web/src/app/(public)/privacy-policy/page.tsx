import { CmsPage, cmsMetadata } from "@/components/public/CmsPage";

export const generateMetadata = cmsMetadata("privacy-policy", "Privacy Policy");

export default function PrivacyPage() {
  return <CmsPage slug="privacy-policy" fallbackTitle="Privacy Policy" />;
}
