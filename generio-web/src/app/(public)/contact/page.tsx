import { CmsPage, cmsMetadata } from "@/components/public/CmsPage";

export const generateMetadata = cmsMetadata("contact", "Contact");

export default function ContactPage() {
  return <CmsPage slug="contact" fallbackTitle="Contact" />;
}
