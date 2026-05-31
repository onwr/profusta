import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

function redirectForRole(
  role: string,
  providerStatus?: string | null,
): string {
  if (role === "ADMIN") return "/admin";
  if (role === "PROVIDER") {
    return providerStatus === "APPROVED" ? "/usta" : "/usta-basvuru/beklemede";
  }
  return "/musteri";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  const authPaths = [
    "/giris",
    "/kayit",
    "/usta-basvuru",
    "/sifremi-unuttum",
    "/sifre-sifirla",
  ];
  const isAuthPath = authPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isAuthPath && session) {
    return NextResponse.redirect(
      new URL(redirectForRole(session.role, session.providerStatus), request.url),
    );
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      return redirectToLogin(request, pathname);
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/musteri") || pathname === "/talep-olustur") {
    if (!session) return redirectToLogin(request, pathname);
    if (session.role !== "CUSTOMER" && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/usta") && !pathname.startsWith("/usta-basvuru")) {
    if (!session) return redirectToLogin(request, pathname);
    if (session.role !== "PROVIDER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (session.providerStatus !== "APPROVED") {
      return NextResponse.redirect(
        new URL("/usta-basvuru/beklemede", request.url),
      );
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const url = new URL("/giris", request.url);
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/musteri/:path*",
    "/talep-olustur",
    "/usta/:path*",
    "/giris",
    "/kayit",
    "/usta-basvuru/:path*",
    "/sifremi-unuttum",
    "/sifre-sifirla",
  ],
};
