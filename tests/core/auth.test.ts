import assert from "node:assert/strict";
import test from "node:test";

import { signAuthToken, verifyAuthToken } from "../../lib/auth";
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_MAX_AGE_SECONDS,
  getAuthCookieOptions,
  getExpiredAuthCookieOptions,
} from "../../lib/authCookie";
import { getMongoUri } from "../../lib/dbConnect";

test("getMongoUri prefers MONGO_URI and falls back to MONGODB_URI", () => {
  assert.equal(
    getMongoUri({
      MONGO_URI: "mongodb://primary",
      MONGODB_URI: "mongodb://fallback",
    }),
    "mongodb://primary",
  );

  assert.equal(
    getMongoUri({
      MONGODB_URI: "mongodb://fallback",
    }),
    "mongodb://fallback",
  );
});

test("getMongoUri throws when no database environment variable is defined", () => {
  assert.throws(
    () => getMongoUri({}),
    /Please define the MONGO_URI or MONGODB_URI environment variable\./,
  );
});

test("auth cookie helpers keep a consistent cookie contract", () => {
  const cookieOptions = getAuthCookieOptions(true);

  assert.equal(AUTH_COOKIE_NAME, "token");
  assert.equal(cookieOptions.httpOnly, true);
  assert.equal(cookieOptions.secure, true);
  assert.equal(cookieOptions.sameSite, "lax");
  assert.equal(cookieOptions.maxAge, AUTH_TOKEN_MAX_AGE_SECONDS);
  assert.equal(cookieOptions.path, "/");

  const expiredCookieOptions = getExpiredAuthCookieOptions(false);

  assert.equal(expiredCookieOptions.secure, false);
  assert.equal(expiredCookieOptions.path, "/");
  assert.ok(expiredCookieOptions.expires instanceof Date);
});

test("signAuthToken and verifyAuthToken round-trip the auth payload", () => {
  const env = { JWT_SECRET: "test-secret" };
  const payload = { userId: "user-123", username: "caner" };

  const token = signAuthToken(payload, env);

  assert.deepEqual(verifyAuthToken(token, env), payload);
});

test("verifyAuthToken rejects invalid JWT strings", () => {
  assert.throws(
    () => verifyAuthToken("invalid-token", { JWT_SECRET: "test-secret" }),
    /Invalid token\./,
  );
});
