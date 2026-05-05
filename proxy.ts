import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "./lib/authCookie";

type AuthRedirectInput = {
  hasToken: boolean;
  pathname: string;
};

export function getAuthRedirectPath({
  hasToken,
  pathname,
}: AuthRedirectInput): "/dashboard" | "/login" | null {
  if (
    !hasToken &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/profile"))
  ) {
    return "/login";
  }

  if (
    hasToken &&
    (pathname === "/login" || pathname === "/register" || pathname === "/signup")
  ) {
    return "/dashboard";
  }

  return null;
}

export function proxy(request: NextRequest) {
  const redirectPath = getAuthRedirectPath({
    hasToken: Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value),
    pathname: request.nextUrl.pathname,
  });

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/profile/:path*", "/register", "/signup"],
};
