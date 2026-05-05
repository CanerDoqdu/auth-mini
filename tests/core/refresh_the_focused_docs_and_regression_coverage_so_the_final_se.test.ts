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

test("README and env example keep the seeded walkthrough and environment guidance in sync", () => {
  const readme = readProjectFile(["README.md"]);
  const envExample = readProjectFile([".env.example"]);

  assert.match(readme, /Use one of the seeded accounts:/);
  assert.match(readme, /\| `demo` \| `demo123` \| `demo@authmini\.dev` \|/);
  assert.match(readme, /\| `guest` \| `guest123` \| `guest@authmini\.dev` \|/);
  assert.match(readme, /The public demo walkthrough uses the canonical route story: `\/login` -> `\/signup` -> `\/profile`\./);
  assert.match(readme, /Start on `\/` to show the seeded credentials and the JWT-in-HttpOnly-cookie story\./);
  assert.match(readme, /Open `\/login`, click \*\*Use demo account\*\*, and sign in as `demo \/ demo123`\./);
  assert.match(readme, /Open `\/signup`, create a fresh account, and show that the app signs the user in immediately with the same session contract\./);
  assert.match(readme, /Refresh `\/profile` to prove the JWT cookie survives navigation\./);
  assert.match(readme, /Click \*\*Log out securely\*\* to clear the JWT cookie and return to `\/login`\./);

  assert.match(envExample, /## Copy this file to \.env\.local for the local demo\./);
  assert.match(envExample, /## Seeded accounts:/);
  assert.match(envExample, /## - demo \/ demo123 \/ demo@authmini\.dev/);
  assert.match(envExample, /## - guest \/ guest123 \/ guest@authmini\.dev/);
  assert.match(envExample, /## Canonical presentation flow: \/login -> \/signup -> \/profile/);
  assert.match(envExample, /JWT_SECRET=dev-secret-change-before-production/);
  assert.match(envExample, /# AUTH_USER_STORE_FILE=\.\/data\/users\.json/);
  assert.match(envExample, /## Relative paths resolve from the project root on every platform\./);
});

test("package scripts and README QA commands keep the docs contract test in the focused lane", () => {
  const readme = readProjectFile(["README.md"]);
  const packageJson = readProjectJson<PackageJson>(["package.json"]);

  assert.equal(packageJson.scripts.test, "node tests/run-tests.mjs");
  assert.equal(
    packageJson.scripts["test:docs-contract"],
    "npm test -- tests/core/refresh_the_focused_docs_and_regression_coverage_so_the_final_se.test.ts",
  );
  assert.match(
    packageJson.scripts["checkpoint:quality"] ?? "",
    /tests\/core\/refresh_the_focused_docs_and_regression_coverage_so_the_final_se\.test\.ts/,
  );
  assert.match(
    readme,
    /npm test -- tests\/core\/refresh_the_focused_docs_and_regression_coverage_so_the_final_se\.test\.ts/,
  );
  assert.match(readme, /npm run checkpoint:quality/);
  assert.match(
    readme,
    /The focused test runner accepts either repo-relative or absolute test file paths, which keeps the `npm test -- tests\/core\/<module>\.test\.ts` QA commands portable on Windows shells\./,
  );
});

test("focused test runner still accepts relative and absolute paths for the QA commands", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(process.cwd(), "tests", "core", "docs-contract-smoke-"),
  );
  const smokeTestFile = path.join(tempRoot, "smoke.test.cjs");
  const relativeSmokeTestFile = path.relative(process.cwd(), smokeTestFile);
  const missingTestFile = path.join(tempRoot, "missing.test.cjs");
  const runTestsEntry = path.join("tests", "run-tests.mjs");

  fs.writeFileSync(
    smokeTestFile,
    [
      'const assert = require("node:assert/strict");',
      'const test = require("node:test");',
      'test("docs runner smoke", () => {',
      '  assert.equal(1, 1);',
      "});",
      "",
    ].join("\n"),
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
    assert.match(relativeResult.stdout, /docs runner smoke/);

    assert.equal(absoluteResult.status, 0, absoluteResult.stderr || absoluteResult.stdout);
    assert.match(absoluteResult.stdout, /docs runner smoke/);

    assert.equal(missingFileResult.status, 1);
    assert.match(
      missingFileResult.stderr,
      new RegExp(`Test file not found: .*${path.basename(missingTestFile)}`),
    );
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});
