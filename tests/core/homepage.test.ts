import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  HOMEPAGE_BUILD_BUDGETS,
  getHomepageBuildBudgetReport,
  getHomepageBudgetViolations,
  getHomepageSourceAudit,
} from "../../lib/homepageQuality";

test("homepage source stays server-rendered and avoids the old lag triggers", () => {
  const audit = getHomepageSourceAudit();

  assert.equal(audit.isServerComponent, true);
  assert.equal(audit.avoidsPointerTracking, true);
  assert.equal(audit.hasAuthCallsToAction, true);
  assert.equal(audit.hasReducedMotionFallback, true);
});

test("homepage build budget helper fails clearly when build artifacts are missing", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "auth-mini-homepage-"));

  try {
    assert.throws(
      () => getHomepageBuildBudgetReport(tempRoot),
      /Build manifest not found .* Run `npm run build` first\./,
    );
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }
});

test("homepage emitted assets stay inside the first-checkpoint budgets", () => {
  const report = getHomepageBuildBudgetReport();
  const violations = getHomepageBudgetViolations(report);

  assert.equal(report.isStaticRoute, true);
  assert.equal(report.cssAssetCount > 0, true);
  assert.equal(report.rootMainBytes <= HOMEPAGE_BUILD_BUDGETS.maxRootMainBytes, true);
  assert.equal(report.cssBytes <= HOMEPAGE_BUILD_BUDGETS.maxCssBytes, true);
  assert.equal(report.serverPageBytes <= HOMEPAGE_BUILD_BUDGETS.maxServerPageBytes, true);
  assert.deepEqual(violations, []);
});
