import dbConnect from "@/lib/dbConnect";
import {
  applyAuthCookie,
  getPublicAuthErrorMessage,
  INVALID_AUTH_REQUEST_MESSAGE,
  isInvalidAuthRequestError,
  normalizeAuthField,
  normalizePasswordField,
  readJsonBody,
  signAuthToken,
} from "@/lib/auth";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request, "Login");
    const usernameTrimmed = normalizeAuthField(body.username);
    const passwordValue = normalizePasswordField(body.password);

    if (!usernameTrimmed || !passwordValue) {
      return NextResponse.json(
        { message: "Username and password are required." },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.login(usernameTrimmed, passwordValue);
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

    const invalidCredentialsMessage = "Invalid username or password";
    const status =
      error instanceof Error && error.message === invalidCredentialsMessage
        ? 401
        : isInvalidAuthRequestError(error)
          ? 400
          : 500;
    const message = getPublicAuthErrorMessage(
      error,
      [INVALID_AUTH_REQUEST_MESSAGE, invalidCredentialsMessage],
      "Unable to log in right now.",
    );

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
