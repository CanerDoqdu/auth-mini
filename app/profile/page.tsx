import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import dbConnect from "@/lib/dbConnect";
import { verifyAuthToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/authCookie";
import User from "@/models/User";

import LogoutButton from "./logout-button";

type SessionUser = {
  email: string;
  username: string;
};

async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { userId } = verifyAuthToken(token);

    await dbConnect();

    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    return {
      username: user.username,
      email: user.email,
    };
  } catch (error) {
    console.error("Profile session error:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const accountType =
    user.username === "demo" || user.username === "guest"
      ? "Seeded demo account"
      : "Fresh account created in signup";

  const sessionDetails = [
    { label: "Signed in as", value: user.username },
    { label: "Email", value: user.email },
    { label: "Session mode", value: "HttpOnly auth cookie" },
    { label: "Protected route", value: "/profile" },
  ];

  const proofPoints = [
    "The page is server rendered and only resolves with a valid auth token.",
    "Refreshing keeps the authenticated state instead of dropping back to guest screens.",
    "Logout clears the cookie and returns the app to the login route.",
  ];

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-topbar">
          <div>
            <p className="profile-eyebrow">Authenticated demo state</p>
            <h1>{user.username}, you are inside the protected profile.</h1>
            <p className="profile-copy">
              This is the destination both login and signup now build toward. The
              UI is tuned for demos, but the session is still backed by the same
              repaired auth flow.
            </p>
          </div>

          <div className="profile-links">
            <Link href="/">Home</Link>
            <Link href="/login">Login</Link>
            <Link href="/signup">Signup</Link>
          </div>
        </div>

        <div className="profile-status-banner">
          <div>
            <span className="profile-status-label">Account type</span>
            <strong>{accountType}</strong>
          </div>
          <div>
            <span className="profile-status-label">Profile status</span>
            <strong>Protected route live</strong>
          </div>
        </div>

        <div className="profile-panels">
          <div>
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
          </div>

          <aside className="profile-side-card">
            <p className="preview-card-label">Session controls</p>
            <h2>Complete the demo loop.</h2>
            <p className="profile-copy">
              Head back home, try another account flow, or log out to show how
              the app returns to the guest experience.
            </p>
            <LogoutButton />
          </aside>
        </div>
      </section>
    </main>
  );
}
