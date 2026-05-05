import SignupScreen from "../signup/signup-screen";

export const metadata = {
  title: "Register | Auth Mini Demo",
  description:
    "Use the compatibility register route to create a demo account, receive a JWT-backed session, and land in the protected dashboard alias.",
};

export default function RegisterPage() {
  return <SignupScreen variant="register" />;
}
