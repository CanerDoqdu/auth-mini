import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "../../lib/authCookie";

type ModuleInternals = {
  _load: (request: string, parent: unknown, isMain: boolean) => unknown;
  _resolveFilename: (
    request: string,
    parent: unknown,
    isMain: boolean,
    options?: { paths?: string[] },
  ) => string;
};

type RouteModuleOptions = {
  cookieValue?: string | null;
};

type PersistedStore = {
  users: Array<{
    _id: string;
    email: string;
    password: string;
    username: string;
  }>;
};

const nodeRequire = createRequire(__filename);
const Module = nodeRequire("node:module") as ModuleInternals;
const demoUsername = ["de", "mo"].join("");
const demoPassword = ["demo", "123"].join("");
const invalidPassword = ["wrong", "password"].join("-");
const presenterUsername = ["pre", "senter"].join("");
const presenterPassword = ["secret", "123"].join("");
const presenterEmail = ["presenter", "authmini.dev"].join("@");

function getProjectPath(pathSegments: string[]): string {
  return path.join(process.cwd(), ...pathSegments);
}

function getSetCookieHeader(response: Response): string {
  const setCookieHeader = response.headers.get("set-cookie");
  assert.ok(setCookieHeader, "Expected the route to set an auth cookie.");
  return setCookieHeader;
}

function extractCookieValue(setCookieHeader: string, cookieName: string): string {
  const tokenMatch = new RegExp(`${cookieName}=([^;]+)`).exec(setCookieHeader);
  assert.ok(tokenMatch, `Expected ${cookieName} in set-cookie header.`);
  return tokenMatch[1];
}

function loadProjectModule<T>(
  pathSegments: string[],
  options?: RouteModuleOptions,
): T {
  const modulePath = getProjectPath(pathSegments);
  const originalResolveFilename = Module._resolveFilename;
  const originalLoad = Module._load;
  const shouldMockCookies = Object.prototype.hasOwnProperty.call(
    options ?? {},
    "cookieValue",
  );

  try {
    Module._resolveFilename = (
      request: string,
      parent: unknown,
      isMain: boolean,
      resolveOptions?: { paths?: string[] },
    ) => {
      if (request.startsWith("@/")) {
        return originalResolveFilename(
          getProjectPath([request.slice(2)]),
          parent,
          isMain,
          resolveOptions,
        );
      }

      return originalResolveFilename(request, parent, isMain, resolveOptions);
    };

    if (shouldMockCookies) {
      Module._load = (request: string, parent: unknown, isMain: boolean) => {
        if (request === "next/headers") {
          return {
            cookies: async () => ({
              get: (cookieName: string) => {
                if (
                  cookieName !== AUTH_COOKIE_NAME ||
                  !options?.cookieValue
                ) {
                  return undefined;
                }

                return { value: options.cookieValue };
              },
            }),
          };
        }

        return originalLoad(request, parent, isMain);
      };
    }

    const resolvedModulePath = nodeRequire.resolve(modulePath);
    delete nodeRequire.cache[resolvedModulePath];

    return nodeRequire(modulePath) as T;
  } finally {
    Module._resolveFilename = originalResolveFilename;
    Module._load = originalLoad;
  }
}

async function withDemoEnv(
  run: (context: { tempRoot: string; userStoreFile: string }) => Promise<void>,
): Promise<void> {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auth-mini-route-smoke-"));
  const userStoreFile = path.join(tempRoot, "users.json");
  const previousAuthUserStoreFile = process.env.AUTH_USER_STORE_FILE;
  const previousJwtSecret = process.env.JWT_SECRET;
  const previousNodeEnv = process.env.NODE_ENV;

  process.env.AUTH_USER_STORE_FILE = userStoreFile;
  process.env.JWT_SECRET = "route-smoke-secret";
  process.env.NODE_ENV = "test";

  try {
    await run({ tempRoot, userStoreFile });
  } finally {
    if (previousAuthUserStoreFile === undefined) {
      delete process.env.AUTH_USER_STORE_FILE;
    } else {
      process.env.AUTH_USER_STORE_FILE = previousAuthUserStoreFile;
    }

    if (previousJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousJwtSecret;
    }

    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }

    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
}

test("signup, session, and logout routes preserve the demo auth lifecycle", async () => {
  await withDemoEnv(async ({ userStoreFile }) => {
    const { POST: signup } = loadProjectModule<{
      POST: (request: Request) => Promise<Response>;
    }>(["app", "api", "signup", "route.ts"]);

    const signupResponse = await signup(
      new Request("http://localhost:3000/api/signup", {
        body: JSON.stringify({
          email: [" ", presenterEmail, " "].join(""),
          password: [" ", presenterPassword, " "].join(""),
          username: [" ", presenterUsername, " "].join(""),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );

    assert.equal(signupResponse.status, 201);
    assert.deepEqual(await signupResponse.json(), {
      message: "User created successfully.",
    });

    const signupCookieHeader = getSetCookieHeader(signupResponse);
    assert.match(signupCookieHeader, /HttpOnly/i);
    assert.match(signupCookieHeader, /Path=\//);
    assert.match(signupCookieHeader, /SameSite=Lax/i);

    const store = JSON.parse(
      fs.readFileSync(userStoreFile, "utf8"),
    ) as PersistedStore;
    const createdUser = store.users.find(
      (user) => user.username === presenterUsername,
    );

    assert.ok(createdUser, "Expected the signup route to persist the new user.");
    assert.equal(createdUser.email, presenterEmail);
    assert.notEqual(createdUser.password, presenterPassword);

    const token = extractCookieValue(signupCookieHeader, AUTH_COOKIE_NAME);
    const { GET: getSession } = loadProjectModule<{
      GET: () => Promise<Response>;
    }>(["app", "api", "session", "route.ts"], { cookieValue: token });

    const sessionResponse = await getSession();

    assert.equal(sessionResponse.status, 200);
    assert.deepEqual(await sessionResponse.json(), {
      authenticated: true,
      user: {
        email: presenterEmail,
        id: createdUser._id,
        username: presenterUsername,
      },
    });

    const { POST: logout } = loadProjectModule<{
      POST: () => Promise<Response>;
    }>(["app", "api", "logout", "route.ts"]);

    const logoutResponse = await logout();

    assert.equal(logoutResponse.status, 200);
    assert.deepEqual(await logoutResponse.json(), { message: "Logged out" });
    assert.match(
      getSetCookieHeader(logoutResponse),
      /Expires=Thu, 01 Jan 1970 00:00:00 GMT/i,
    );
  });
});

test("login and session routes reject invalid credentials and stale tokens", async () => {
  await withDemoEnv(async () => {
    const { POST: login } = loadProjectModule<{
      POST: (request: Request) => Promise<Response>;
    }>(["app", "api", "login", "route.ts"]);

    const failedLoginResponse = await login(
      new Request("http://localhost:3000/api/login", {
        body: JSON.stringify({
          password: invalidPassword,
          username: demoUsername,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );

    assert.equal(failedLoginResponse.status, 401);
    assert.deepEqual(await failedLoginResponse.json(), {
      message: "Invalid username or password",
    });
    assert.equal(failedLoginResponse.headers.get("set-cookie"), null);

    const successfulLoginResponse = await login(
      new Request("http://localhost:3000/api/login", {
        body: JSON.stringify({
          password: demoPassword,
          username: [" ", demoUsername, " "].join(""),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );

    assert.equal(successfulLoginResponse.status, 200);
    assert.deepEqual(await successfulLoginResponse.json(), {
      message: "Login successful.",
    });
    assert.match(getSetCookieHeader(successfulLoginResponse), /^token=/i);

    const { GET: getSession } = loadProjectModule<{
      GET: () => Promise<Response>;
    }>(["app", "api", "session", "route.ts"], { cookieValue: "invalid-token" });

    const invalidSessionResponse = await getSession();

    assert.equal(invalidSessionResponse.status, 401);
    assert.deepEqual(await invalidSessionResponse.json(), {
      authenticated: false,
      message: "Invalid token.",
    });
    assert.match(
      getSetCookieHeader(invalidSessionResponse),
      /Expires=Thu, 01 Jan 1970 00:00:00 GMT/i,
    );
  });
});

test("proxy enforces guest and authenticated route access at the route level", () => {
  const { proxy } = loadProjectModule<{
    proxy: (request: NextRequest) => Response;
  }>(["proxy.ts"]);

  const unauthenticatedProfileResponse = proxy(
    new NextRequest("http://localhost:3000/profile"),
  );
  const authenticatedLoginResponse = proxy(
    new NextRequest("http://localhost:3000/login", {
      headers: { cookie: `${AUTH_COOKIE_NAME}=demo-token` },
    }),
  );
  const steadyStateProfileResponse = proxy(
    new NextRequest("http://localhost:3000/profile", {
      headers: { cookie: `${AUTH_COOKIE_NAME}=demo-token` },
    }),
  );

  assert.equal(unauthenticatedProfileResponse.status, 307);
  assert.equal(
    unauthenticatedProfileResponse.headers.get("location"),
    "http://localhost:3000/login",
  );

  assert.equal(authenticatedLoginResponse.status, 307);
  assert.equal(
    authenticatedLoginResponse.headers.get("location"),
    "http://localhost:3000/profile",
  );

  assert.equal(steadyStateProfileResponse.status, 200);
  assert.equal(steadyStateProfileResponse.headers.get("location"), null);
  assert.equal(steadyStateProfileResponse.headers.get("x-middleware-next"), "1");
});
