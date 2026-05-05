import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "./lib/authCookie";

type AuthRedirectInput = {
  hasToken: boolean;
  pathname: string;
};

export function getAuthRedirectPath({
  hasToken,
  pathname,
}: AuthRedirectInput): "/login" | "/profile" | null {
  if (!hasToken && pathname.startsWith("/profile")) {
    return "/login";
  }

  if (hasToken && (pathname === "/login" || pathname === "/signup")) {
    return "/profile";
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
  matcher: ["/login", "/signup", "/profile/:path*"],
};
