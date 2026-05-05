import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

function readProjectFile(pathSegments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...pathSegments), "utf8");
}

test("demo auth surfaces expose presentation-ready copy and seeded guidance", () => {
  const demoPasswordPattern = /demo"\s*,\s*"123/;
  const homepageSource = readProjectFile(["app", "page.tsx"]);
  const loginSource = readProjectFile(["app", "login", "page.tsx"]);
  const signupSource = readProjectFile(["app", "signup", "page.tsx"]);
  const profileSource = readProjectFile(["app", "profile", "page.tsx"]);
  const logoutSource = readProjectFile(["app", "profile", "logout-button.tsx"]);
  const layoutSource = readProjectFile(["app", "layout.tsx"]);
  const globalStyles = readProjectFile(["app", "globals.css"]);

  assert.match(homepageSource, /Demo-ready authentication experience/);
  assert.match(homepageSource, /<strong>Username:<\/strong> demo/);
  assert.match(homepageSource, demoPasswordPattern);
  assert.match(homepageSource, /href="\/profile"/);

  assert.match(loginSource, /Use demo account/);
  assert.match(loginSource, /demo@authmini\.dev/);
  assert.match(loginSource, /Opening profile\.\.\./);
  assert.match(loginSource, demoPasswordPattern);

  assert.match(signupSource, /New users are signed in immediately and redirected to \/profile\./);
  assert.match(signupSource, demoPasswordPattern);

  assert.match(profileSource, /Protected route live/);
  assert.match(profileSource, /Session controls/);

  assert.match(logoutSource, /Log out securely/);
  assert.match(layoutSource, /Auth Mini Demo/);

  assert.match(globalStyles, /\.auth-shell/);
  assert.match(globalStyles, /\.demo-credentials-card/);
  assert.match(globalStyles, /\.profile-status-banner/);
});
