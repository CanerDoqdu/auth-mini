export const AUTH_COOKIE_NAME = "token";
export const AUTH_TOKEN_MAX_AGE_SECONDS = 3 * 24 * 60 * 60;

export type AuthCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  maxAge?: number;
  expires?: Date;
  path: "/";
};

export function getAuthCookieOptions(
  isProduction = process.env.NODE_ENV === "production",
): AuthCookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: AUTH_TOKEN_MAX_AGE_SECONDS,
    path: "/",
  };
}

export function getExpiredAuthCookieOptions(
  isProduction = process.env.NODE_ENV === "production",
): AuthCookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  };
}
