import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  getAuthTokenState,
  getSafeRelativeRedirectPath,
  INVALID_AUTH_EMAIL_MESSAGE,
  INVALID_AUTH_REQUEST_MESSAGE,
  INVALID_AUTH_TOKEN_MESSAGE,
  MISSING_JWT_SECRET_MESSAGE,
  isValidEmailAddress,
  normalizeAuthField,
  readJsonBody,
  signAuthToken,
  verifyAuthToken,
} from "../../lib/auth";
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_MAX_AGE_SECONDS,
  getAuthCookieOptions,
  getExpiredAuthCookieOptions,
} from "../../lib/authCookie";
import dbConnect, { getUserStoreFilePath } from "../../lib/dbConnect";
import { getSeedUsers } from "../../lib/userStore";
import User from "../../models/User";
import { getAuthRedirectPath } from "../../proxy";

test("getUserStoreFilePath uses an override and defaults to the demo data path", () => {
  const overridePath = path.join("C:", "temp", "users.json");

  assert.equal(
    getUserStoreFilePath({ AUTH_USER_STORE_FILE: overridePath }),
    overridePath,
  );

  assert.equal(
    getUserStoreFilePath({}),
    path.join(process.cwd(), "data", "users.json"),
  );
});

test("dbConnect seeds a fresh local user store with demo accounts", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auth-mini-store-"));
  const userStoreFile = path.join(tempRoot, "users.json");

  try {
    const connection = await dbConnect({ AUTH_USER_STORE_FILE: userStoreFile });

    assert.equal(connection.connected, true);
    assert.equal(connection.storeFilePath, userStoreFile);

    const fileContents = fs.readFileSync(userStoreFile, "utf8");
    const parsed = JSON.parse(fileContents) as { users: Array<{ username: string }> };

    assert.deepEqual(
      parsed.users.map((user) => user.username),
      getSeedUsers().map((user) => user.username),
    );
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});

test("User.login authenticates the seeded demo account from a local store", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auth-mini-login-"));
  const env = { AUTH_USER_STORE_FILE: path.join(tempRoot, "users.json") };

  try {
    await dbConnect(env);
    const user = await User.login("demo", "demo123", env);

    assert.equal(user.username, "demo");
    assert.equal(user.email, "demo@authmini.dev");
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});

test("User.login authenticates the seeded guest account from a local store", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auth-mini-guest-login-"));
  const env = { AUTH_USER_STORE_FILE: path.join(tempRoot, "users.json") };

  try {
    await dbConnect(env);
    const user = await User.login("guest", "guest123", env);

    assert.equal(user.username, "guest");
    assert.equal(user.email, "guest@authmini.dev");
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});

test("User.signup persists new local users and rejects duplicate credentials", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auth-mini-signup-"));
  const env = { AUTH_USER_STORE_FILE: path.join(tempRoot, "users.json") };

  try {
    await dbConnect(env);

    const createdUser = await User.signup(
      "newdemo",
      "newdemo@authmini.dev",
      "secret123",
      env,
    );

    const loadedUser = await User.findById(createdUser._id, env);

    assert.equal(loadedUser?.username, "newdemo");
    assert.equal(loadedUser?.email, "newdemo@authmini.dev");
    assert.notEqual(loadedUser?.password, "secret123");

    await assert.rejects(
      () => User.signup("newdemo", "another@authmini.dev", "secret123", env),
      /Username or email already exists\./,
    );
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});

test("User.signup rejects invalid email addresses before writing to the local store", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auth-mini-invalid-email-"));
  const env = { AUTH_USER_STORE_FILE: path.join(tempRoot, "users.json") };

  try {
    await dbConnect(env);

    await assert.rejects(
      () => User.signup("brokenemail", "not-an-email", "secret123", env),
      new RegExp(INVALID_AUTH_EMAIL_MESSAGE),
    );
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});

test("User.signup enforces duplicate checks case-insensitively for usernames and emails", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auth-mini-normalized-signup-"));
  const env = { AUTH_USER_STORE_FILE: path.join(tempRoot, "users.json") };

  try {
    await dbConnect(env);

    const createdUser = await User.signup(
      "CaseUser",
      "CaseUser@authmini.dev",
      "secret123",
      env,
    );
    const loadedUser = await User.findById(createdUser._id, env);

    assert.equal(loadedUser?.username, "CaseUser");
    assert.equal(loadedUser?.email, "caseuser@authmini.dev");

    await assert.rejects(
      () => User.signup(" caseuser ", "another@authmini.dev", "secret123", env),
      /Username or email already exists\./,
    );
    await assert.rejects(
      () => User.signup("anotheruser", " CASEUSER@authmini.dev ", "secret123", env),
      /Username or email already exists\./,
    );
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
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

test("signAuthToken falls back to the demo JWT secret when none is configured", () => {
  const payload = { userId: "user-123", username: "caner" };
  const env = { NODE_ENV: "development" };
  const token = signAuthToken(payload, env);

  assert.deepEqual(verifyAuthToken(token, env), payload);
});

test("signAuthToken requires an explicit JWT secret in production", () => {
  const payload = { userId: "user-123", username: "caner" };

  assert.throws(
    () => signAuthToken(payload, { NODE_ENV: "production" }),
    new RegExp(MISSING_JWT_SECRET_MESSAGE),
  );
});

test("verifyAuthToken rejects invalid JWT strings", () => {
  assert.throws(
    () => verifyAuthToken("invalid-token", { JWT_SECRET: "test-secret" }),
    new RegExp(INVALID_AUTH_TOKEN_MESSAGE),
  );
});

test("getAuthTokenState distinguishes missing invalid and authenticated tokens", () => {
  const env = { JWT_SECRET: "test-secret" };
  const payload = { userId: "user-123", username: "caner" };
  const validToken = signAuthToken(payload, env);

  assert.deepEqual(getAuthTokenState(undefined, env), { status: "missing" });
  assert.deepEqual(getAuthTokenState("invalid-token", env), { status: "invalid" });
  assert.deepEqual(getAuthTokenState(validToken, env), {
    payload,
    status: "authenticated",
  });
});

test("normalizeAuthField trims strings and rejects non-string values", () => {
  assert.equal(normalizeAuthField("  demo  "), "demo");
  assert.equal(normalizeAuthField("   "), null);
  assert.equal(normalizeAuthField(123), null);
  assert.equal(normalizeAuthField({ value: "demo" }), null);
});

test("isValidEmailAddress accepts normal addresses and rejects malformed input", () => {
  assert.equal(isValidEmailAddress("demo@authmini.dev"), true);
  assert.equal(isValidEmailAddress("not-an-email"), false);
  assert.equal(isValidEmailAddress("demo@authmini"), false);
});

test("readJsonBody rejects malformed or non-object auth payloads", async () => {
  await assert.rejects(
    () =>
      readJsonBody(
        new Request("http://localhost:3000/api/login", {
          body: JSON.stringify(["demo"]),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
        "Login",
      ),
    new RegExp(INVALID_AUTH_REQUEST_MESSAGE),
  );

  await assert.rejects(
    () =>
      readJsonBody(
        new Request("http://localhost:3000/api/login", {
          body: "{",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
        "Login",
      ),
    new RegExp(INVALID_AUTH_REQUEST_MESSAGE),
  );
});

test("getSafeRelativeRedirectPath accepts same-origin relative paths only", () => {
  assert.equal(getSafeRelativeRedirectPath("/login"), "/login");
  assert.equal(
    getSafeRelativeRedirectPath("/profile?tab=security#password"),
    "/profile?tab=security#password",
  );
  assert.equal(getSafeRelativeRedirectPath("//evil.example/login"), null);
  assert.equal(getSafeRelativeRedirectPath("https://evil.example/login"), null);
  assert.equal(getSafeRelativeRedirectPath("/\\evil.example"), null);
  assert.equal(getSafeRelativeRedirectPath("/profile%0d%0aX-Test: injected"), null);
  assert.equal(getSafeRelativeRedirectPath("login"), null);
  assert.equal(getSafeRelativeRedirectPath(null), null);
});

test("getAuthRedirectPath sends unauthenticated profile requests to login", () => {
  assert.equal(
    getAuthRedirectPath({ authState: "missing", pathname: "/profile" }),
    "/login",
  );
  assert.equal(
    getAuthRedirectPath({ authState: "invalid", pathname: "/profile/settings" }),
    "/login",
  );
  assert.equal(
    getAuthRedirectPath({ authState: "missing", pathname: "/dashboard" }),
    "/login",
  );
});

test("getAuthRedirectPath keeps authenticated users out of guest auth pages", () => {
  assert.equal(
    getAuthRedirectPath({ authState: "authenticated", pathname: "/login" }),
    "/profile",
  );
  assert.equal(
    getAuthRedirectPath({ authState: "authenticated", pathname: "/signup" }),
    "/profile",
  );
  assert.equal(
    getAuthRedirectPath({ authState: "authenticated", pathname: "/register" }),
    "/profile",
  );
});

test("getAuthRedirectPath allows valid route access in steady-state sessions", () => {
  assert.equal(
    getAuthRedirectPath({ authState: "authenticated", pathname: "/profile/security" }),
    null,
  );
  assert.equal(
    getAuthRedirectPath({ authState: "missing", pathname: "/login" }),
    null,
  );
  assert.equal(
    getAuthRedirectPath({ authState: "invalid", pathname: "/signup" }),
    null,
  );
  assert.equal(
    getAuthRedirectPath({ authState: "invalid", pathname: "/register" }),
    null,
  );
  assert.equal(
    getAuthRedirectPath({ authState: "authenticated", pathname: "/dashboard" }),
    null,
  );
  assert.equal(AUTH_COOKIE_NAME, "token");
});
