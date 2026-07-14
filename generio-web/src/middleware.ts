import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5080";

type PublicRedirect = {
  fromPath: string;
  toUrl: string;
  isPermanent: boolean;
};

let redirectCache: { at: number; rules: PublicRedirect[] } | null = null;

async function loadRedirects(): Promise<PublicRedirect[]> {
  const now = Date.now();
  if (redirectCache && now - redirectCache.at < 60_000) {
    return redirectCache.rules;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/redirects`, {
      cache: "no-store",
    });
    if (!response.ok) return redirectCache?.rules ?? [];
    const rules = (await response.json()) as PublicRedirect[];
    redirectCache = { at: now, rules };
    return rules;
  } catch {
    return redirectCache?.rules ?? [];
  }
}

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1).toLowerCase();
  }
  return pathname.toLowerCase() || "/";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("generio_admin");

  if (pathname.startsWith("/admin/login")) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/_next")) {
    const rules = await loadRedirects();
    const match = rules.find((rule) => normalizePath(rule.fromPath) === normalizePath(pathname));
    if (match) {
      const target = match.toUrl.startsWith("http")
        ? match.toUrl
        : new URL(match.toUrl, request.url).toString();
      return NextResponse.redirect(target, match.isPermanent ? 308 : 307);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\..*).*)"],
};
