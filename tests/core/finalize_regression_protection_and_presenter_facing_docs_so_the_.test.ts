import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

type PackageJson = {
  scripts: Record<string, string | undefined>;
};

function readProjectFile(pathSegments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...pathSegments), "utf8");
}

function readProjectJson<T>(pathSegments: string[]) {
  return JSON.parse(readProjectFile(pathSegments)) as T;
}

test("README and env example keep the presenter handoff path reproducible", () => {
  const readme = readProjectFile(["README.md"]);
  const envExample = readProjectFile([".env.example"]);

  assert.match(readme, /Install dependencies: `npm install`/);
  assert.match(readme, /Copy-Item \.env\.example \.env\.local/);
  assert.match(readme, /Start the app: `npm run dev`/);
  assert.match(readme, /Use one of the seeded accounts:/);
  assert.match(readme, /\| `demo` \| `demo123` \| `demo@authmini\.dev` \|/);
  assert.match(readme, /\| `guest` \| `guest123` \| `guest@authmini\.dev` \|/);
  assert.match(readme, /The public demo walkthrough uses the canonical route story: `\/login` -> `\/signup` -> `\/profile`\./);
  assert.match(readme, /## Production-style rehearsal/);
  assert.match(readme, /npm run build/);
  assert.match(readme, /npm start/);
  assert.match(
    readme,
    /`npm start` already loads `\.env\.example`, so the built demo keeps the seeded users, local JSON store default, and JWT secret from the presenter path without extra setup\./,
  );
  assert.match(readme, /Open `\/login`, click \*\*Use demo account\*\*, and sign in as `demo \/ demo123`\./);
  assert.match(readme, /Open `\/signup`, create a fresh account, and show that the app signs the user in immediately with the same session contract\./);
  assert.match(readme, /Refresh `\/profile` to prove the JWT cookie survives navigation\./);
  assert.match(readme, /Click \*\*Log out securely\*\* to clear the JWT cookie and return to `\/login`\./);
  assert.match(readme, /npm run test:demo-handoff/);
  assert.match(
    readme,
    /npm test -- tests\/core\/finalize_regression_protection_and_presenter_facing_docs_so_the_\.test\.ts/,
  );
  assert.match(
    readme,
    /`npm start` is the closest rehearsal for the live handoff path because it boots the built app with the committed demo env contract\./,
  );

  assert.match(envExample, /## npm start also reads this file for the production-style handoff rehearsal\./);
  assert.match(envExample, /## Seeded accounts:/);
  assert.match(envExample, /## Canonical presentation flow: \/login -> \/signup -> \/profile/);
  assert.match(envExample, /JWT_SECRET=dev-secret-change-before-production/);
  assert.match(envExample, /# AUTH_USER_STORE_FILE=\.\/data\/users\.json/);
});

test("package scripts and focused runner keep the handoff regression lock wired to exact QA commands", () => {
  const readme = readProjectFile(["README.md"]);
  const packageJson = readProjectJson<PackageJson>(["package.json"]);
  const runTestsSource = readProjectFile(["tests", "run-tests.mjs"]);

  assert.equal(packageJson.scripts.test, "node tests/run-tests.mjs");
  assert.equal(
    packageJson.scripts["test:demo-handoff"],
    "npm test -- tests/core/finalize_regression_protection_and_presenter_facing_docs_so_the_.test.ts",
  );
  assert.match(
    packageJson.scripts["checkpoint:quality"] ?? "",
    /tests\/core\/finalize_regression_protection_and_presenter_facing_docs_so_the_\.test\.ts/,
  );
  assert.match(readme, /npm run checkpoint:quality/);
  assert.match(runTestsSource, /path\.isAbsolute\(targetArg\)/);
  assert.match(runTestsSource, /path\.normalize\(targetArg\)/);
  assert.match(runTestsSource, /path\.join\(process\.cwd\(\), targetArg\)/);
  assert.match(runTestsSource, /Test file not found:/);
});

test("focused test runner accepts relative and absolute handoff lock paths and rejects missing files", () => {
  const tempRoot = fs.mkdtempSync(path.join(process.cwd(), "tests", "core", "handoff-runner-smoke-"));
  const smokeTestFile = path.join(tempRoot, "smoke.test.cjs");
  const relativeSmokeTestFile = path.relative(process.cwd(), smokeTestFile);
  const missingTestFile = path.join(tempRoot, "missing.test.cjs");
  const runTestsEntry = path.join("tests", "run-tests.mjs");

  fs.writeFileSync(
    smokeTestFile,
    [
      'const assert = require("node:assert/strict");',
      'const test = require("node:test");',
      'test("handoff runner smoke", () => {',
      '  assert.equal(path.join("demo", "flow"), "demo" + require("node:path").sep + "flow");',
      "});",
      "",
    ].join("\n").replace("path.join", 'require("node:path").join'),
    "utf8",
  );

  try {
    const relativeResult = spawnSync(process.execPath, [runTestsEntry, relativeSmokeTestFile], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const absoluteResult = spawnSync(process.execPath, [runTestsEntry, smokeTestFile], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const missingFileResult = spawnSync(process.execPath, [runTestsEntry, missingTestFile], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    assert.equal(relativeResult.status, 0, relativeResult.stderr || relativeResult.stdout);
    assert.match(relativeResult.stdout, /handoff runner smoke/);

    assert.equal(absoluteResult.status, 0, absoluteResult.stderr || absoluteResult.stdout);
    assert.match(absoluteResult.stdout, /handoff runner smoke/);

    assert.equal(missingFileResult.status, 1);
    assert.match(
      missingFileResult.stderr,
      new RegExp(`Test file not found: .*${path.basename(missingTestFile)}`),
    );
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});
