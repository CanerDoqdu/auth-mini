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
  assert.match(
    homepageSource,
    /Compatibility\s+aliases\s+<strong>\/register<\/strong>\s+and\s+<strong>\/dashboard<\/strong>/,
  );
  assert.match(homepageSource, /Present the canonical story as \/login -&gt; \/signup -&gt; \/profile/);
  assert.match(homepageSource, /Use seeded credentials/);
  assert.match(homepageSource, /Create a fresh user live/);
  assert.match(homepageSource, /Prove the session/);
  assert.match(homepageSource, /Canonical walkthrough/);
  assert.match(homepageSource, /The demo now reads like a real product flow instead of a set of disconnected routes\./);
  assert.match(homepageSource, /Server-validated protected route instead of a mocked success panel/);

  assert.match(loginSource, /Use demo account/);
  assert.match(loginSource, /demo@authmini\.dev/);
  assert.match(loginSource, /Opening profile\.\.\./);
  assert.match(loginSource, demoPasswordPattern);
  assert.match(loginSource, /href="\/signup"/);
  assert.match(loginSource, /href="\/profile"/);
  assert.match(loginSource, /Signed JWT stored in an HttpOnly cookie on success/);
  assert.match(loginSource, /opens \/profile/);
  assert.match(loginSource, /Demo-ready reminder/);
  assert.match(loginSource, /Lead the live story with <strong>\/login<\/strong>/);
  assert.match(loginSource, /<span className="route-chip">\/signup<\/span>/);
  assert.match(loginSource, /Fastest route/);
  assert.match(loginSource, /Fresh account option/);
  assert.match(loginSource, /shortest live walkthrough/);
  assert.match(loginSource, /The same repaired auth contract powers both the seeded demo login/);

  assert.match(signupSource, /variant="signup"/);
  assert.match(signupSource, /presentation-ready guidance/);
  assert.match(signupScreenSource, /New users receive a JWT-backed session immediately and are redirected to \/profile\./);
  assert.match(signupScreenSource, /Present the guest flow as <strong>\/login<\/strong> -&gt;/);
  assert.match(signupScreenSource, /const secondaryRouteHref = isRegisterRoute \? "\/signup" : "\/register";/);
  assert.match(signupScreenSource, /const secondaryRouteLabel = isRegisterRoute \? "Canonical signup" : "Register alias";/);
  assert.match(signupScreenSource, /href=\{secondaryRouteHref\}/);
  assert.match(signupScreenSource, /canonical new-user flow/);
  assert.match(signupScreenSource, demoPasswordPattern);
  assert.match(signupScreenSource, /What the protected landing proves/);
  assert.match(signupScreenSource, /Login-ready credentials/);
  assert.match(signupScreenSource, /Same protected payoff/);
  assert.match(signupScreenSource, /Alias-safe demo story/);
  assert.match(registerSource, /variant="register"/);
  assert.match(registerSource, /Register \| Auth Mini Demo/);
  assert.match(registerSource, /protected dashboard alias/);

  assert.match(profileSource, /variant="profile"/);
  assert.match(profileSource, /logout controls/);
  assert.match(profileScreenSource, /JWT-protected route live/);
  assert.match(profileScreenSource, /canonical protected destination for the JWT demo/);
  assert.match(profileScreenSource, /Route context/);
  assert.match(profileScreenSource, /dashboard alias stays available/);
  assert.match(profileScreenSource, /Open dashboard alias/);
  assert.match(profileScreenSource, /JWT in HttpOnly cookie/);
  assert.match(profileScreenSource, /Session controls/);
  assert.match(profileScreenSource, /Presentation path: \/login -> \/signup -> \/profile/);
  assert.match(profileScreenSource, /Alias path: \/login -> \/register -> \/dashboard/);
  assert.match(profileScreenSource, /Live demo checklist/);
  assert.match(profileScreenSource, /Refresh once to prove the cookie survives beyond the initial redirect\./);
  assert.match(dashboardSource, /variant="dashboard"/);
  assert.match(dashboardSource, /Dashboard \| Auth Mini Demo/);
  assert.match(dashboardSource, /canonical profile flow/);

  assert.match(logoutSource, /Log out securely/);
  assert.match(logoutSource, /protected state is reversible/);
  assert.match(layoutSource, /Auth Mini Demo/);
  assert.match(layoutSource, /themeColor: "#0a0a0a"/);

  assert.match(globalStyles, /\.auth-shell/);
  assert.match(globalStyles, /\.demo-credentials-card/);
  assert.match(globalStyles, /\.hero-path-grid/);
  assert.match(globalStyles, /\.profile-status-banner/);
  assert.match(globalStyles, /\.route-chip-row/);
  assert.match(globalStyles, /\.journey-grid/);
  assert.match(globalStyles, /\.surface-muted/);
  assert.match(globalStyles, /\.hero-support-copy/);
  assert.match(globalStyles, /\.profile-route-context/);
});

test("demo auth screens stay wired to the repaired route contract", () => {
  const loginSource = readProjectFile(["app", "login", "page.tsx"]);
  const signupScreenSource = readProjectFile(["app", "signup", "signup-screen.tsx"]);
  const registerSource = readProjectFile(["app", "register", "page.tsx"]);
  const profileScreenSource = readProjectFile(["app", "profile", "profile-screen.tsx"]);
  const logoutSource = readProjectFile(["app", "profile", "logout-button.tsx"]);

  assert.match(loginSource, /fetch\("\/api\/login"/);
  assert.match(loginSource, /router\.replace\("\/profile"\)/);
  assert.match(loginSource, /router\.refresh\(\)/);

  assert.match(signupScreenSource, /fetch\("\/api\/signup"/);
  assert.match(
    signupScreenSource,
    /const protectedRouteHref = isRegisterRoute \? "\/dashboard" : "\/profile";/,
  );
  assert.match(signupScreenSource, /router\.replace\(protectedRouteHref\)/);
  assert.match(registerSource, /SignupScreen variant="register"/);

  assert.match(profileScreenSource, /redirectPath: getSessionCleanupPath\("\/login"\)/);
  assert.match(profileScreenSource, /<LogoutButton \/>/);
  assert.match(logoutSource, /fetch\("\/api\/logout"/);
  assert.match(logoutSource, /router\.replace\("\/login"\)/);
});
