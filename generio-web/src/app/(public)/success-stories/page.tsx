import { CmsPage, cmsMetadata } from "@/components/public/CmsPage";

export const generateMetadata = cmsMetadata("success-stories", "Success Stories");

export default function SuccessStoriesPage() {
  return <CmsPage slug="success-stories" fallbackTitle="Success Stories" />;
}
