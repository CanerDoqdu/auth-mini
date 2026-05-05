import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthTokenState } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/authCookie";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

import LogoutButton from "./logout-button";

type SessionUser = {
  email: string;
  username: string;
};

type ProfileScreenVariant = "dashboard" | "profile";

type ProfileScreenProps = {
  variant: ProfileScreenVariant;
};

type SessionUserResult =
  | { redirectPath: string; status: "redirect" }
  | { status: "authenticated"; user: SessionUser };

function getSessionCleanupPath(redirectTo: string) {
  const searchParams = new URLSearchParams({ redirectTo });
  return `/api/session?${searchParams.toString()}`;
}

async function getSessionUser(): Promise<SessionUserResult> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const authState = getAuthTokenState(token);

  if (authState.status === "missing") {
    return { redirectPath: "/login", status: "redirect" };
  }

  if (authState.status === "invalid") {
    return {
      redirectPath: getSessionCleanupPath("/login"),
      status: "redirect",
    };
  }

  try {
    await dbConnect();

    const user = await User.findById(authState.payload.userId);

    if (!user) {
      return {
        redirectPath: getSessionCleanupPath("/login"),
        status: "redirect",
      };
    }

    return {
      status: "authenticated",
      user: {
        username: user.username,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Profile session error:", error);
    throw error;
  }
}

export default async function ProfileScreen({ variant }: ProfileScreenProps) {
  const session = await getSessionUser();

  if (session.status === "redirect") {
    redirect(session.redirectPath);
  }

  const { user } = session;

  const isDashboardRoute = variant === "dashboard";
  const protectedRoute = isDashboardRoute ? "/dashboard" : "/profile";
  const guestSignupRoute = isDashboardRoute ? "/register" : "/signup";
  const protectedRouteLabel = isDashboardRoute
    ? "JWT-protected dashboard live"
    : "JWT-protected route live";
  const destinationHeading = isDashboardRoute
    ? `${user.username}, your demo dashboard is unlocked.`
    : `${user.username}, you are inside the protected profile.`;
  const introCopy = isDashboardRoute
    ? "This dashboard reuses the same repaired auth runtime as /profile, but presents the post-login state with the route naming the demo expects and a JWT-backed session behind it."
    : "This is the canonical protected destination for the JWT demo. Login and signup both issue the same signed token into an HttpOnly cookie, so the authenticated state is easy to prove live.";
  const accountType =
    user.username === "demo" || user.username === "guest"
      ? "Seeded demo account"
      : isDashboardRoute
        ? "Fresh account created in register"
        : "Fresh account created in signup";

  const sessionDetails = [
    { label: "Signed in as", value: user.username },
    { label: "Email", value: user.email },
    { label: "Session mode", value: "JWT in HttpOnly cookie" },
    { label: "Protected route", value: protectedRoute },
  ];

  const proofPoints = [
    "The page is server rendered and only resolves with a valid JWT-backed auth token.",
    "Refreshing keeps the authenticated state by reusing the HttpOnly cookie instead of dropping back to guest screens.",
    "Logout clears the JWT cookie and returns the app to the login route.",
  ];
  const sessionChecklist = [
    `Show the authenticated destination as ${protectedRoute}.`,
    "Refresh once to prove the cookie survives beyond the initial redirect.",
    "Use logout to return cleanly to the guest flow.",
  ];
  const sessionActions = [
    { href: "/", label: "Back to home" },
    { href: "/login", label: "Replay login" },
    {
      href: guestSignupRoute,
      label: isDashboardRoute ? "Open register" : "Open signup",
    },
    {
      href: isDashboardRoute ? "/profile" : "/dashboard",
      label: isDashboardRoute ? "Open canonical profile" : "Open dashboard alias",
    },
  ];
  const routeStory = isDashboardRoute
    ? ["/login", "/register", "/dashboard"]
    : ["/login", "/signup", "/profile"];
  const routeContextCopy = isDashboardRoute
    ? "This compatibility alias shows the same authenticated data shape after register. Guest auth still resolves to /profile as the primary protected finish."
    : "This is the canonical protected finish. The dashboard alias stays available for older links without changing the guest auth story.";

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-topbar">
          <div>
            <p className="profile-eyebrow">Authenticated demo state</p>
            <h1>{destinationHeading}</h1>
            <p className="profile-copy">{introCopy}</p>
          </div>

          <div className="profile-links">
            <Link href="/">Home</Link>
            <Link href="/login">Login</Link>
            <Link href={guestSignupRoute}>
              {isDashboardRoute ? "Register" : "Signup"}
            </Link>
          </div>
        </div>

        <div className="profile-status-banner">
          <div>
            <span className="profile-status-label">Account type</span>
            <strong>{accountType}</strong>
          </div>
          <div>
            <span className="profile-status-label">Profile status</span>
            <strong>{protectedRouteLabel}</strong>
          </div>
        </div>

        <div className="route-chip-row" aria-label="Protected route story">
          {routeStory.map((route) => (
            <span
              className={`route-chip ${route === protectedRoute ? "route-chip-active" : ""}`}
              key={route}
            >
              {route}
            </span>
          ))}
        </div>

        <div className="profile-panels">
          <div>
            <div className="surface-muted profile-route-context">
              <p className="preview-card-label">Route context</p>
              <p>{routeContextCopy}</p>
            </div>

            <div className="profile-details">
              {sessionDetails.map((detail) => (
                <div className="profile-detail" key={detail.label}>
                  <span>{detail.label}</span>
                  <strong>{detail.value}</strong>
                </div>
              ))}
            </div>

            <div className="profile-proof-card">
              <p className="preview-card-label">What this screen proves</p>
              <ul className="profile-proof-list">
                {proofPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="profile-proof-card">
              <p className="preview-card-label">Live demo checklist</p>
              <ul className="profile-proof-list">
                {sessionChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="profile-side-card">
            <p className="preview-card-label">Session controls</p>
            <h2>Complete the JWT demo loop.</h2>
            <p className="profile-copy">
              Head back home, revisit /login or /signup, or log out to show how
              the app returns to the guest experience.
            </p>
            <p className="profile-copy">
              {isDashboardRoute
                ? "Alias path: /login -> /register -> /dashboard. Canonical guest path still finishes at /profile."
                : "Presentation path: /login -> /signup -> /profile, with /register and /dashboard kept as compatibility aliases."}
            </p>
            <div className="profile-link-grid">
              {sessionActions.map((action) => (
                <Link href={action.href} key={action.href}>
                  {action.label}
                </Link>
              ))}
            </div>
            <LogoutButton />
          </aside>
        </div>
      </section>
    </main>
  );
}
