import dbConnect from "@/lib/dbConnect";
import {
  applyAuthCookie,
  getPublicAuthErrorMessage,
  INVALID_AUTH_REQUEST_MESSAGE,
  isInvalidAuthRequestError,
  normalizeAuthField,
  readJsonBody,
  signAuthToken,
} from "@/lib/auth";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request, "Signup");
    const usernameTrimmed = normalizeAuthField(body.username);
    const emailValue = normalizeAuthField(body.email);
    const emailTrimmed = emailValue?.toLowerCase() ?? null;
    const passwordTrimmed = normalizeAuthField(body.password);

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

    const newUser = await User.signup(
      usernameTrimmed,
      emailTrimmed,
      passwordTrimmed,
    );

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
    console.error("Signup error:", error);
    const duplicateUserMessage = "Username or email already exists.";
    const message =
      getPublicAuthErrorMessage(
        error,
        [INVALID_AUTH_REQUEST_MESSAGE, duplicateUserMessage],
        "Unable to sign up right now.",
      );

    const status =
      message === duplicateUserMessage ||
      isInvalidAuthRequestError(error)
        ? 400
        : 500;

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
