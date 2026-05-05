import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

type RunningServer = {
  child: ReturnType<typeof spawn>;
  output: () => string;
  port: number;
};

type PackageJson = {
  scripts?: {
    start?: string;
  };
};

function getProjectPath(pathSegments: string[]) {
  return path.join(process.cwd(), ...pathSegments);
}

function extractCookieValue(setCookieHeader: string, cookieName: string) {
  const match = new RegExp(`${cookieName}=([^;]*)`).exec(setCookieHeader);

  assert.ok(match, `Expected ${cookieName} in set-cookie header.`);
  return match[1];
}

async function getAvailablePort() {
  const { createServer } = await import("node:net");

  return await new Promise<number>((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Unable to determine a free port.")));
        return;
      }

      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(port);
      });
    });
  });
}

async function startBuiltServer(userStoreFile: string): Promise<RunningServer> {
  const port = await getAvailablePort();
  const nextBinPath = getProjectPath(["node_modules", "next", "dist", "bin", "next"]);
  const childEnv = {
    ...process.env,
    AUTH_USER_STORE_FILE: userStoreFile,
  };
  let combinedOutput = "";

  delete childEnv.JWT_SECRET;

  const child = spawn(
    process.execPath,
    [
      "--env-file=.env.example",
      nextBinPath,
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      cwd: process.cwd(),
      env: childEnv,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  child.stdout.on("data", (chunk: Buffer | string) => {
    combinedOutput += chunk.toString();
  });
  child.stderr.on("data", (chunk: Buffer | string) => {
    combinedOutput += chunk.toString();
  });

  const server = {
    child,
    output: () => combinedOutput,
    port,
  };

  try {
    await waitForServer(server);
    return server;
  } catch (error) {
    child.kill();
    throw error;
  }
}

async function waitForServer(server: RunningServer) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (server.child.exitCode !== null) {
      throw new Error(
        [
          "Built auth demo server exited before it became ready.",
          server.output(),
        ].join("\n"),
      );
    }

    try {
      const response = await fetch(`http://127.0.0.1:${server.port}/login`);

      if (response.ok) {
        return;
      }
    } catch {
      // The server is still booting.
    }

    await delay(250);
  }

  throw new Error(
    [
      "Timed out waiting for the built auth demo server to respond.",
      server.output(),
    ].join("\n"),
  );
}

test("built demo runtime keeps signup, login, logout, and session working with the committed demo env", async () => {
  const buildIdPath = getProjectPath([".next", "BUILD_ID"]);
  const packageJson = JSON.parse(
    fs.readFileSync(getProjectPath(["package.json"]), "utf8"),
  ) as PackageJson;

  assert.ok(
    fs.existsSync(buildIdPath),
    `Expected a built app at ${buildIdPath}. Run npm run build before this smoke test.`,
  );
  assert.equal(
    packageJson.scripts?.start,
    "node --env-file=.env.example ./node_modules/next/dist/bin/next start",
  );

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auth-mini-runtime-smoke-"));
  const userStoreFile = path.join(tempRoot, "users.json");
  const username = ["smoke", Date.now().toString(36)].join("-");
  const email = [username, "authmini.dev"].join("@");
  let server: RunningServer | null = null;

  try {
    server = await startBuiltServer(userStoreFile);

    const signupResponse = await fetch(
      `http://127.0.0.1:${server.port}/api/signup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: "secret123",
          username,
        }),
      },
    );

    const signupBody = await signupResponse.json();

    assert.equal(
      signupResponse.status,
      201,
      `Expected signup to succeed. Received ${JSON.stringify(signupBody)}\n${server.output()}`,
    );
    assert.deepEqual(signupBody, {
      message: "User created successfully.",
    });

    const signupSetCookie = signupResponse.headers.get("set-cookie");
    assert.ok(signupSetCookie, "Expected signup to set an auth cookie.");
    assert.match(signupSetCookie, /token=/i);
    assert.match(signupSetCookie, /HttpOnly/i);

    const signupCookie = extractCookieValue(signupSetCookie, "token");
    assert.ok(signupCookie, "Expected a signed JWT cookie value after signup.");

    const signupSessionResponse = await fetch(
      `http://127.0.0.1:${server.port}/api/session`,
      {
        headers: {
          Cookie: `token=${signupCookie}`,
        },
      },
    );

    assert.equal(signupSessionResponse.status, 200);
    const signupSessionBody = await signupSessionResponse.json();

    assert.equal(signupSessionBody.authenticated, true);
    assert.equal(signupSessionBody.user.email, email);
    assert.equal(signupSessionBody.user.username, username);
    assert.equal(typeof signupSessionBody.user.id, "string");
    assert.ok(signupSessionBody.user.id);

    const logoutResponse = await fetch(
      `http://127.0.0.1:${server.port}/api/logout`,
      {
        method: "POST",
        headers: {
          Cookie: `token=${signupCookie}`,
        },
      },
    );

    assert.equal(logoutResponse.status, 200);
    assert.deepEqual(await logoutResponse.json(), {
      message: "Logged out",
    });

    const logoutSetCookie = logoutResponse.headers.get("set-cookie");
    assert.ok(logoutSetCookie, "Expected logout to clear the auth cookie.");
    assert.match(logoutSetCookie, /token=/i);
    assert.match(logoutSetCookie, /Expires=/i);

    const clearedCookie = extractCookieValue(logoutSetCookie, "token");
    assert.equal(clearedCookie, "");

    const postLogoutSessionResponse = await fetch(
      `http://127.0.0.1:${server.port}/api/session`,
      {
        headers: {
          Cookie: "token=",
        },
      },
    );

    assert.equal(postLogoutSessionResponse.status, 401);
    assert.deepEqual(await postLogoutSessionResponse.json(), {
      authenticated: false,
      message: "No token provided.",
    });

    const loginResponse = await fetch(
      `http://127.0.0.1:${server.port}/api/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: "secret123",
          username,
        }),
      },
    );

    assert.equal(loginResponse.status, 200);
    assert.deepEqual(await loginResponse.json(), {
      message: "Login successful.",
    });

    const loginSetCookie = loginResponse.headers.get("set-cookie");
    assert.ok(loginSetCookie, "Expected login to set an auth cookie.");

    const loginCookie = extractCookieValue(loginSetCookie, "token");
    assert.ok(loginCookie, "Expected a signed JWT cookie value after login.");

    const loginSessionResponse = await fetch(
      `http://127.0.0.1:${server.port}/api/session`,
      {
        headers: {
          Cookie: `token=${loginCookie}`,
        },
      },
    );

    assert.equal(loginSessionResponse.status, 200);
    const loginSessionBody = await loginSessionResponse.json();

    assert.equal(loginSessionBody.authenticated, true);
    assert.equal(loginSessionBody.user.email, email);
    assert.equal(loginSessionBody.user.username, username);
    assert.equal(typeof loginSessionBody.user.id, "string");
    assert.ok(loginSessionBody.user.id);
  } finally {
    if (server?.child.exitCode === null) {
      server.child.kill();
    }

    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});
