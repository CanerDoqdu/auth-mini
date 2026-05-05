import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import dbConnect from "@/lib/dbConnect";
import { verifyAuthToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/authCookie";
import User from "@/models/User";

import LogoutButton from "./logout-button";

type SessionUser = {
  username: string;
  email: string;
};

async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { userId } = verifyAuthToken(token);

    await dbConnect();

    const user = await User.findById(userId)
      .select("_id username email")
      .lean<{ username: string; email: string } | null>();

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

  return (
    <main className="profile-page">
      <section className="profile-card">
        <p className="profile-eyebrow">Authenticated session</p>
        <h1>Welcome, {user.username}</h1>
        <p className="profile-copy">
          Your current session is active and protected with an HttpOnly token.
        </p>

        <div className="profile-details">
          <div className="profile-detail">
            <span>Username</span>
            <strong>{user.username}</strong>
          </div>
          <div className="profile-detail">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
        </div>

        <div className="profile-links">
          <Link href="/">Back to home</Link>
          <Link href="/profile">Protected route</Link>
        </div>

        <LogoutButton />
      </section>
    </main>
  );
}
