export const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Generio" },
  { href: "/services", label: "Services" },
  { href: "/markets", label: "Markets We Cover" },
  { href: "/industries", label: "Industries" },
  { href: "/partners", label: "Partner Network" },
  { href: "/success-stories", label: "Success Stories", hideIfEmpty: "stories" as const },
  { href: "/contact", label: "Contact" },
] as const;

export const footerQuickLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/markets", label: "Markets" },
  { href: "/contact", label: "Contact" },
] as const;

export const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookie-policy", label: "Cookies" },
] as const;
