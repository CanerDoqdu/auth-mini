"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function handleLogout() {
    setError(null);
    setLogoutLoading(true);

    try {
      const response = await fetch("/api/logout", { method: "POST" });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message || "Logout failed.");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout request failed:", error);
      setError("Unable to log out right now.");
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <div className="profile-actions">
      <p className="logout-note">Clear the auth cookie and return to the login route.</p>
      {error ? <p className="profile-error">{error}</p> : null}
      <button
        className="submit-btn profile-logout-button"
        disabled={logoutLoading}
        onClick={handleLogout}
        type="button"
      >
        {logoutLoading ? "Clearing session..." : "Log out securely"}
      </button>
      <p className="logout-support-copy">
        This keeps the demo honest by showing that the protected state is reversible,
        not a one-way mock success screen.
      </p>
    </div>
  );
}
