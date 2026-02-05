import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  await dbConnect();

  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { authenticated: false, message: "No token provided." },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId).select("_id username email");

    if (!user) {
      return NextResponse.json(
        { authenticated: false, message: "User not found." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: { id: user._id, username: user.username, email: user.email },
      },
      { status: 200 }
    );
  } catch (err)  { console.error(err); 
    return NextResponse.json(
      { authenticated: false, message: "Invalid token." },
      { status: 401 }
    );
  }
}
