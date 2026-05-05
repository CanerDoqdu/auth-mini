import { clearAuthCookie, getAuthTokenState } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/authCookie";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function getSessionRedirectTarget(request: Request) {
  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  if (!redirectTo || !redirectTo.startsWith("/")) {
    return null;
  }

  return redirectTo;
}

function createSessionFailureResponse({
  clearCookie,
  message,
  request,
  status,
}: {
  clearCookie: boolean;
  message: string;
  request: Request;
  status: number;
}) {
  const redirectTo = getSessionRedirectTarget(request);

  if (redirectTo) {
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    return clearCookie ? clearAuthCookie(response) : response;
  }

  const response = NextResponse.json(
    { authenticated: false, message },
    { status },
  );

  return clearCookie ? clearAuthCookie(response) : response;
}

export async function GET(request: Request) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const authState = getAuthTokenState(token);

  if (authState.status === "missing") {
    return createSessionFailureResponse({
      clearCookie: false,
      message: "No token provided.",
      request,
      status: 401,
    });
  }

  if (authState.status === "invalid") {
    return createSessionFailureResponse({
      clearCookie: true,
      message: "Invalid token.",
      request,
      status: 401,
    });
  }

  try {
    await dbConnect();

    const user = await User.findById(authState.payload.userId);

    if (!user) {
      return createSessionFailureResponse({
        clearCookie: true,
        message: "User not found.",
        request,
        status: 401,
      });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: { id: user._id, username: user.username, email: user.email },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        message: "Unable to load session.",
      },
      { status: 500 },
    );
  }
}
