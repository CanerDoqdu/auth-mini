"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionUser = {
  id: string;
  username: string;
  email?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();

        if (res.ok && data?.authenticated && data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [router]);

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
    } finally {
      setLogoutLoading(false);
    }
  }

  if (loading) {
    return <p style={{ margin: "2rem" }}>Loading...</p>;
  }

  return (
    <main style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h1>Profile</h1>

      {user && (
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          {user.email && <p><strong>Email:</strong> {user.email}</p>}
        </div>
      )}

      <button onClick={handleLogout} disabled={logoutLoading}>
        {logoutLoading ? "Logging out..." : "Logout"}
      </button>
    </main>
  );
}
