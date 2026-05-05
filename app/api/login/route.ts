import dbConnect from "@/lib/dbConnect";
import {
  applyAuthCookie,
  isInvalidAuthRequestError,
  normalizeAuthField,
  readJsonBody,
  signAuthToken,
} from "@/lib/auth";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request, "Login");
    const usernameTrimmed = normalizeAuthField(body.username);
    const passwordTrimmed = normalizeAuthField(body.password);

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
    console.error("Login error:", error);

    const status =
      error instanceof Error && error.message === "Invalid username or password"
        ? 401
        : isInvalidAuthRequestError(error)
          ? 400
          : 500;
    const message = isInvalidAuthRequestError(error)
      ? error.message
      : error instanceof Error
        ? error.message
        : "Unable to log in right now.";

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
