import dbConnect from "@/lib/dbConnect";
import { applyAuthCookie, signAuthToken } from "@/lib/auth";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();
    const usernameTrimmed = username?.trim();
    const emailTrimmed = email?.trim().toLowerCase();
    const passwordTrimmed = password?.trim();

    if (!usernameTrimmed || !emailTrimmed || !passwordTrimmed) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 },
      );
    }

    if (passwordTrimmed.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    await dbConnect();

    const newUser = await User.signup(usernameTrimmed, emailTrimmed, passwordTrimmed);

    const token = signAuthToken({
      userId: String(newUser._id),
      username: newUser.username,
    });

    const response = NextResponse.json(
      { message: "User created successfully." },
      { status: 201 },
    );

    return applyAuthCookie(response, token);
  } catch (error) {
    const err = error as Error;
    console.error("Signup error:", error);
    const message = err.message === "Username or email already exists."
      ? "Username or email already exists."
      : err.message || "An error occurred during signup.";

    const status = message === "Username or email already exists." ? 400 : 500;

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
