import dbConnect from "@/lib/dbConnect";
import {
  applyAuthCookie,
  INVALID_AUTH_EMAIL_MESSAGE,
  getPublicAuthErrorMessage,
  INVALID_AUTH_REQUEST_MESSAGE,
  isValidEmailAddress,
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
    const body = await readJsonBody(request, "Signup");
    const usernameTrimmed = normalizeAuthField(body.username);
    const emailValue = normalizeAuthField(body.email);
    const emailTrimmed = emailValue?.toLowerCase() ?? null;
    const passwordValue = normalizePasswordField(body.password);

    if (!usernameTrimmed || !emailTrimmed || !passwordValue) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 },
      );
    }

    if (!isValidEmailAddress(emailTrimmed)) {
      return NextResponse.json(
        { message: INVALID_AUTH_EMAIL_MESSAGE },
        { status: 400 },
      );
    }

    if (passwordValue.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    await dbConnect();

    const newUser = await User.signup(
      usernameTrimmed,
      emailTrimmed,
      passwordValue,
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
        [
          INVALID_AUTH_EMAIL_MESSAGE,
          INVALID_AUTH_REQUEST_MESSAGE,
          duplicateUserMessage,
        ],
        "Unable to sign up right now.",
      );

    const status =
      message === duplicateUserMessage ||
      message === INVALID_AUTH_EMAIL_MESSAGE ||
      isInvalidAuthRequestError(error)
        ? 400
        : 500;

    return NextResponse.json(
      { message },
      { status },
    );
  }
}
