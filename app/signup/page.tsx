import SignupScreen from "./signup-screen";

export const metadata = {
  title: "Signup | Auth Mini Demo",
  description:
    "Create a demo account, receive a JWT-backed session, and land on the protected /profile route with presentation-ready guidance.",
};

export default function SignupPage() {
  return <SignupScreen variant="signup" />;
}
