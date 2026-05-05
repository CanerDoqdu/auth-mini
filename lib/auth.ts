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
export const INVALID_AUTH_REQUEST_MESSAGE = "Invalid request body.";
export const MISSING_JWT_SECRET_MESSAGE =
  "JWT_SECRET must be configured in production.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getJwtSecret(env: NodeJS.ProcessEnv = process.env) {
  const configuredSecret = env.JWT_SECRET?.trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  if (env.NODE_ENV === "production") {
    throw new Error(MISSING_JWT_SECRET_MESSAGE);
  }

  return DEFAULT_DEMO_JWT_SECRET;
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

export function isInvalidAuthRequestError(error: unknown): error is Error {
  return (
    error instanceof Error && error.message === INVALID_AUTH_REQUEST_MESSAGE
  );
}

export function getPublicAuthErrorMessage(
  error: unknown,
  allowedMessages: readonly string[],
  fallbackMessage: string,
): string {
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  return allowedMessages.includes(error.message)
    ? error.message
    : fallbackMessage;
}

export function normalizeAuthField(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

export async function readJsonBody(
  request: Request,
  routeName: string,
): Promise<Record<string, unknown>> {
  try {
    const parsedBody: unknown = await request.json();

    if (!isRecord(parsedBody)) {
      console.error(`${routeName} request parsing error: body must be an object.`);
      throw new Error(INVALID_AUTH_REQUEST_MESSAGE);
    }

    return parsedBody;
  } catch (error) {
    if (isInvalidAuthRequestError(error)) {
      throw error;
    }

    console.error(`${routeName} request parsing error:`, error);
    throw new Error(INVALID_AUTH_REQUEST_MESSAGE);
  }
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

export function getSafeRelativeRedirectPath(
  redirectTo: string | null | undefined,
): string | null {
  if (
    !redirectTo ||
    !redirectTo.startsWith("/") ||
    redirectTo.startsWith("//") ||
    redirectTo.includes("\\") ||
    /[\r\n]/.test(redirectTo) ||
    /%0d|%0a/i.test(redirectTo)
  ) {
    return null;
  }

  try {
    const parsedRedirect = new URL(redirectTo, "http://localhost");

    if (parsedRedirect.origin !== "http://localhost") {
      return null;
    }

    return `${parsedRedirect.pathname}${parsedRedirect.search}${parsedRedirect.hash}`;
  } catch (error) {
    console.error("Redirect parsing error:", error);
    return null;
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
