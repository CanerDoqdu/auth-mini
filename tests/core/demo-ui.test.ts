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
  const signupScreenSource = readProjectFile(["app", "signup", "signup-screen.tsx"]);
  const registerSource = readProjectFile(["app", "register", "page.tsx"]);
  const profileSource = readProjectFile(["app", "profile", "page.tsx"]);
  const profileScreenSource = readProjectFile(["app", "profile", "profile-screen.tsx"]);
  const dashboardSource = readProjectFile(["app", "dashboard", "page.tsx"]);
  const logoutSource = readProjectFile(["app", "profile", "logout-button.tsx"]);
  const layoutSource = readProjectFile(["app", "layout.tsx"]);
  const globalStyles = readProjectFile(["app", "globals.css"]);

  assert.match(homepageSource, /Demo-ready authentication experience/);
  assert.match(homepageSource, /<strong>Username:<\/strong> demo/);
  assert.match(homepageSource, demoPasswordPattern);
  assert.match(homepageSource, /href="\/login"/);
  assert.match(homepageSource, /Start at \/login/);
  assert.match(homepageSource, /JWT cookie live/);
  assert.match(homepageSource, /signed token\s+stored in an HttpOnly cookie/);
  assert.match(homepageSource, /href="\/profile"/);
  assert.match(homepageSource, /Show secure signup, login, profile access, and logout/);
  assert.match(homepageSource, /Present the canonical story as \/login -&gt; \/signup -&gt; \/profile/);

  assert.match(loginSource, /Use demo account/);
  assert.match(loginSource, /demo@authmini\.dev/);
  assert.match(loginSource, /Opening profile\.\.\./);
  assert.match(loginSource, demoPasswordPattern);
  assert.match(loginSource, /href="\/signup"/);
  assert.match(loginSource, /href="\/profile"/);
  assert.match(loginSource, /Signed JWT stored in an HttpOnly cookie on success/);
  assert.match(loginSource, /opens \/profile/);

  assert.match(signupSource, /variant="signup"/);
  assert.match(signupSource, /receive a JWT-backed session/);
  assert.match(signupScreenSource, /New users receive a JWT-backed session immediately and are redirected to \/profile\./);
  assert.match(signupScreenSource, /Present the guest flow as <strong>\/login<\/strong> -&gt;/);
  assert.match(signupScreenSource, demoPasswordPattern);
  assert.match(registerSource, /variant="register"/);

  assert.match(profileSource, /variant="profile"/);
  assert.match(profileSource, /JWT in an HttpOnly cookie/);
  assert.match(profileScreenSource, /JWT-protected route live/);
  assert.match(profileScreenSource, /canonical protected destination for the JWT demo/);
  assert.match(profileScreenSource, /JWT in HttpOnly cookie/);
  assert.match(profileScreenSource, /Session controls/);
  assert.match(profileScreenSource, /Presentation path: \/login -&gt; \/signup -&gt; \/profile/);
  assert.match(dashboardSource, /variant="dashboard"/);

  assert.match(logoutSource, /Log out securely/);
  assert.match(layoutSource, /Auth Mini Demo/);

  assert.match(globalStyles, /\.auth-shell/);
  assert.match(globalStyles, /\.demo-credentials-card/);
  assert.match(globalStyles, /\.profile-status-banner/);
});
