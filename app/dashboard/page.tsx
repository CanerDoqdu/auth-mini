import ProfileScreen from "../profile/profile-screen";

export const metadata = {
  title: "Dashboard | Auth Mini Demo",
  description:
    "Open the protected dashboard alias to review the same JWT-backed authenticated state used by the canonical profile flow.",
};

export default function DashboardPage() {
  return <ProfileScreen variant="dashboard" />;
}
