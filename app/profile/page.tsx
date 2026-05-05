import ProfileScreen from "./profile-screen";

export const metadata = {
  title: "Profile | Auth Mini Demo",
  description:
    "Review the protected demo profile backed by a JWT in an HttpOnly cookie with clear session proof and logout controls.",
};

export default function ProfilePage() {
  return <ProfileScreen variant="profile" />;
}
