import dbConnect from "@/lib/dbConnect";
import { applyAuthCookie, signAuthToken } from "@/lib/auth";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const usernameTrimmed = username?.trim();
    const passwordTrimmed = password?.trim();

    if (!usernameTrimmed || !passwordTrimmed) {
      return NextResponse.json(
        { message: "Username and password are required." },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.login(usernameTrimmed, passwordTrimmed);
    const token = signAuthToken({
      userId: String(user._id),
      username: user.username,
    });

    const response = NextResponse.json(
      { message: "Login successful." },
      { status: 200 },
    );

    return applyAuthCookie(response, token);
  } catch (error) {
    const err = error as Error;
    console.error("Login error:", error);

    const status =
      err.message === "Invalid username or password" ? 401 : 500;

    return NextResponse.json(
      { message: err.message || "Unable to log in right now." },
      { status },
    );
  }
}
