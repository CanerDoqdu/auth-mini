import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie, type AuthTokenState, getAuthTokenState } from "./lib/auth";
import { AUTH_COOKIE_NAME } from "./lib/authCookie";

type AuthRedirectInput = {
  authState: AuthTokenState["status"];
  pathname: string;
};

export function getAuthRedirectPath({
  authState,
  pathname,
}: AuthRedirectInput): "/profile" | "/login" | null {
  if (
    authState !== "authenticated" &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/profile"))
  ) {
    return "/login";
  }

  if (
    authState === "authenticated" &&
    (pathname === "/login" || pathname === "/register" || pathname === "/signup")
  ) {
    return "/profile";
  }

  return null;
}

export function proxy(request: NextRequest) {
  const authState = getAuthTokenState(
    request.cookies.get(AUTH_COOKIE_NAME)?.value,
  );
  const redirectPath = getAuthRedirectPath({
    authState: authState.status,
    pathname: request.nextUrl.pathname,
  });

  const response = redirectPath
    ? NextResponse.redirect(new URL(redirectPath, request.url))
    : NextResponse.next();

  if (authState.status === "invalid") {
    return clearAuthCookie(response);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/profile/:path*", "/register", "/signup"],
};
