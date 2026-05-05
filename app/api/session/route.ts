import { clearAuthCookie, verifyAuthToken } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { authenticated: false, message: "No token provided." },
      { status: 401 },
    );
  }

  try {
    const decoded = verifyAuthToken(token);
    await dbConnect();

    const user = await User.findById(decoded.userId).select("_id username email");

    if (!user) {
      return clearAuthCookie(
        NextResponse.json(
        { authenticated: false, message: "User not found." },
          { status: 401 },
        ),
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: { id: user._id, username: user.username, email: user.email },
      },
      { status: 200 },
    );
  } catch (error) {
    const err = error as Error;
    console.error("Session error:", error);

    const response = NextResponse.json(
      {
        authenticated: false,
        message:
          err.message === "Invalid token."
            ? "Invalid token."
            : "Unable to load session.",
      },
      { status: err.message === "Invalid token." ? 401 : 500 },
    );

    if (err.message === "Invalid token.") {
      return clearAuthCookie(response);
    }

    return response;
  }
}
