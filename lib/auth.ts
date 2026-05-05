import type { NextResponse } from "next/server";
import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";

import {
  AUTH_TOKEN_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getExpiredAuthCookieOptions,
} from "./authCookie";

export type AuthTokenPayload = {
  userId: string;
  username: string;
};

const DEFAULT_DEMO_JWT_SECRET = "auth-mini-demo-local-jwt-secret";

function getJwtSecret(env: NodeJS.ProcessEnv = process.env) {
  return env.JWT_SECRET || DEFAULT_DEMO_JWT_SECRET;
}

export function signAuthToken(
  payload: AuthTokenPayload,
  env: NodeJS.ProcessEnv = process.env,
) {
  return jwt.sign(payload, getJwtSecret(env), {
    expiresIn: AUTH_TOKEN_MAX_AGE_SECONDS,
  });
}

export function verifyAuthToken(
  token: string,
  env: NodeJS.ProcessEnv = process.env,
): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret(env));

    if (typeof decoded === "string") {
      throw new Error("Invalid token.");
    }

    const userId = decoded.userId;
    const username = decoded.username;

    if (typeof userId !== "string" || typeof username !== "string") {
      throw new Error("Invalid token.");
    }

    return { userId, username };
  } catch (error) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError ||
      error instanceof NotBeforeError
    ) {
      throw new Error("Invalid token.");
    }

    throw error;
  }
}

export function applyAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  return response;
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", getExpiredAuthCookieOptions());
  return response;
}
