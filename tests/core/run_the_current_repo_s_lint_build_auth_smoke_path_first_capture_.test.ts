import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { signAuthToken } from "../../lib/auth";
import { AUTH_COOKIE_NAME } from "../../lib/authCookie";
import { getSeedUsers } from "../../lib/userStore";

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

const nodeRequire = createRequire(__filename);
const Module = nodeRequire("node:module") as ModuleInternals;

function getProjectPath(pathSegments: string[]) {
  return path.join(process.cwd(), ...pathSegments);
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
                if (cookieName !== AUTH_COOKIE_NAME || !options?.cookieValue) {
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
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auth-mini-current-smoke-"));
  const userStoreFile = path.join(tempRoot, "users.json");
  const previousAuthUserStoreFile = process.env.AUTH_USER_STORE_FILE;
  const previousJwtSecret = process.env.JWT_SECRET;
  const previousNodeEnv = process.env.NODE_ENV;

  process.env.AUTH_USER_STORE_FILE = userStoreFile;
  process.env.JWT_SECRET = "current-auth-smoke-secret";
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

test("login route ignores malformed duplicate persisted users instead of failing the auth flow", async () => {
  await withDemoEnv(async ({ userStoreFile }) => {
    const seededDemoUser = getSeedUsers()[0];

    fs.writeFileSync(
      userStoreFile,
      `${JSON.stringify(
        {
          users: [
            {
              _id: "broken-demo-record",
              email: seededDemoUser.email,
              username: seededDemoUser.username,
            },
            seededDemoUser,
          ],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const { POST: login } = loadProjectModule<{
      POST: (request: Request) => Promise<Response>;
    }>(["app", "api", "login", "route.ts"]);
    const response = await login(
      new Request("http://localhost:3000/api/login", {
        body: JSON.stringify({
          password: "demo123",
          username: seededDemoUser.username,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      message: "Login successful.",
    });
    assert.match(response.headers.get("set-cookie") ?? "", /^token=/i);
  });
});

test("session route clears stale cookies when the token points at a malformed persisted user", async () => {
  await withDemoEnv(async ({ userStoreFile }) => {
    fs.writeFileSync(
      userStoreFile,
      `${JSON.stringify(
        {
          users: [
            {
              _id: "broken-session-user",
              password: "not-a-real-hash",
              username: "broken",
            },
          ],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    const token = signAuthToken({
      userId: "broken-session-user",
      username: "broken",
    });
    const { GET: getSession } = loadProjectModule<{
      GET: (request: Request) => Promise<Response>;
    }>(["app", "api", "session", "route.ts"], { cookieValue: token });
    const response = await getSession(
      new Request("http://localhost:3000/api/session"),
    );

    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      authenticated: false,
      message: "User not found.",
    });
    assert.match(
      response.headers.get("set-cookie") ?? "",
      /Expires=Thu, 01 Jan 1970 00:00:00 GMT/i,
    );
  });
});
