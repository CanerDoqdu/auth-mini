import { clearAuthCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logged out" },
      { status: 200 },
    );

    return clearAuthCookie(response);
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Unable to log out right now." },
      { status: 500 },
    );
  }
}
