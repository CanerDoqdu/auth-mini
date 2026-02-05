import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, password } = await request.json();
    const usernameTrimmed = username?.trim();
    const passwordTrimmed = password?.trim();

  if (!usernameTrimmed || !passwordTrimmed) {
    return NextResponse.json(
      { message: "Username and password are required." },
      { status: 400 }
    );
  }

  const user = await User.login(usernameTrimmed, passwordTrimmed);
 
   const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );





    const response = NextResponse.json(
      { message: "Login successful." },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    const err = error as Error;
    console.error("Login error:", error);
    return NextResponse.json(
      { message: err.message || "Invalid username or password." },
      { status: 401 }
    );
  }
}
