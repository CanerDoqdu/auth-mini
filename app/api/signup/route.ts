import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";


export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    const usernameTrimmed = username?.trim();
    const emailTrimmed = email?.trim().toLowerCase();
    const passwordTrimmed = password?.trim();

    if (!usernameTrimmed || !emailTrimmed || !passwordTrimmed) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (passwordTrimmed.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const newUser = await User.signup(usernameTrimmed, emailTrimmed, passwordTrimmed);

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    const response = NextResponse.json(
      { message: "User created successfully." },
      { status: 201 }
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
    console.error("Signup error:", error);
    const message = err.message?.includes("duplicate key") 
      ? "Username or email already exists."
      : err.message || "An error occurred during signup.";
    
    return NextResponse.json(
      { message },
      { status: 400 }
    );
  }
}
