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

test("presentation docs keep the exact seeded walkthrough and focused QA commands", () => {
  const readme = readProjectFile(["README.md"]);
  const envExample = readProjectFile([".env.example"]);

  assert.match(readme, /Use one of the seeded accounts:/);
  assert.match(readme, /\| `demo` \| `demo123` \| `demo@authmini\.dev` \|/);
  assert.match(readme, /\| `guest` \| `guest123` \| `guest@authmini\.dev` \|/);
  assert.match(readme, /The public demo walkthrough uses the canonical route story: `\/login` -> `\/signup` -> `\/profile`\./);
  assert.match(readme, /Exact presentation walkthrough/);
  assert.match(readme, /Open `\/login`, click \*\*Use demo account\*\*, and sign in as `demo \/ demo123`\./);
  assert.match(readme, /Click \*\*Log out securely\*\* to clear the JWT cookie and return to `\/login`\./);
  assert.match(
    readme,
    /npm test -- tests\/core\/lock_the_repaired_demo_with_focused_tests_and_exact_presentation\.test\.ts/,
  );
  assert.match(
    readme,
    /npm test -- tests\/core\/refresh_the_focused_docs_and_regression_coverage_so_the_final_se\.test\.ts/,
  );
  assert.match(
    readme,
    /The focused test runner accepts either repo-relative or absolute test file paths, which keeps the `npm test -- tests\/core\/<module>\.test\.ts` QA commands portable on Windows shells\./,
  );

  assert.match(envExample, /## Copy this file to \.env\.local for the local demo\./);
  assert.match(envExample, /## Seeded accounts:/);
  assert.match(envExample, /## - demo \/ demo123 \/ demo@authmini\.dev/);
  assert.match(envExample, /## - guest \/ guest123 \/ guest@authmini\.dev/);
  assert.match(envExample, /## Canonical presentation flow: \/login -> \/signup -> \/profile/);
});

test("package scripts expose the focused presentation lock commands", () => {
  const packageJson = readProjectJson<PackageJson>(["package.json"]);

  assert.equal(packageJson.scripts.test, "node tests/run-tests.mjs");
  assert.equal(
    packageJson.scripts["test:presentation-lock"],
    "npm test -- tests/core/lock_the_repaired_demo_with_focused_tests_and_exact_presentation.test.ts",
  );
  assert.match(
    packageJson.scripts["checkpoint:quality"] ?? "",
    /tests\/core\/lock_the_repaired_demo_with_focused_tests_and_exact_presentation\.test\.ts/,
  );
});

test("focused test runner accepts relative and absolute file paths and rejects missing files", () => {
  const tempRoot = fs.mkdtempSync(
    path.join(process.cwd(), "tests", "core", "run-tests-smoke-"),
  );
  const smokeTestFile = path.join(tempRoot, "smoke.test.cjs");
  const relativeSmokeTestFile = path.relative(process.cwd(), smokeTestFile);
  const missingTestFile = path.join(tempRoot, "missing.test.cjs");
  const runTestsEntry = path.join("tests", "run-tests.mjs");
  const smokeTestSource = [
    'const assert = require("node:assert/strict");',
    'const test = require("node:test");',
    'test("runner smoke", () => {',
    "  assert.equal(1, 1);",
    "});",
    "",
  ].join("\n");

  fs.writeFileSync(smokeTestFile, smokeTestSource, "utf8");

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
    assert.match(relativeResult.stdout, /runner smoke/);

    assert.equal(absoluteResult.status, 0, absoluteResult.stderr || absoluteResult.stdout);
    assert.match(absoluteResult.stdout, /runner smoke/);

    assert.equal(missingFileResult.status, 1);
    assert.match(
      missingFileResult.stderr,
      new RegExp(`Test file not found: .*${path.basename(missingTestFile)}`),
    );
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});
