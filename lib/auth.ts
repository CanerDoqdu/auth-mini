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

export type AuthTokenState =
  | { status: "missing" }
  | { status: "invalid" }
  | { payload: AuthTokenPayload; status: "authenticated" };

const DEFAULT_DEMO_JWT_SECRET = "auth-mini-demo-local-jwt-secret";
export const INVALID_AUTH_TOKEN_MESSAGE = "Invalid token.";

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
      throw new Error(INVALID_AUTH_TOKEN_MESSAGE);
    }

    const userId = decoded.userId;
    const username = decoded.username;

    if (typeof userId !== "string" || typeof username !== "string") {
      throw new Error(INVALID_AUTH_TOKEN_MESSAGE);
    }

    return { userId, username };
  } catch (error) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError ||
      error instanceof NotBeforeError
    ) {
      throw new Error(INVALID_AUTH_TOKEN_MESSAGE);
    }

    throw error;
  }
}

export function isInvalidAuthTokenError(error: unknown): error is Error {
  return (
    error instanceof Error && error.message === INVALID_AUTH_TOKEN_MESSAGE
  );
}

export function getAuthTokenState(
  token: string | undefined,
  env: NodeJS.ProcessEnv = process.env,
): AuthTokenState {
  if (!token) {
    return { status: "missing" };
  }

  try {
    return {
      payload: verifyAuthToken(token, env),
      status: "authenticated",
    };
  } catch (error) {
    if (isInvalidAuthTokenError(error)) {
      return { status: "invalid" };
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
