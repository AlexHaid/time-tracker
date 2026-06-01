import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { encode } from "next-auth/jwt";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Get stored password hash
    const setting = await db.appSetting.findUnique({
      where: { key: "password_hash" },
    });

    if (!setting) {
      return NextResponse.json(
        { error: "App not set up yet" },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = await compare(password, setting.value);
    if (!isValid) {
      return NextResponse.json(
        { error: "Wrong password" },
        { status: 401 }
      );
    }

    // Find the owner user
    const owner = await db.user.findFirst({
      where: { email: "owner@local" },
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Owner account not found" },
        { status: 500 }
      );
    }

    // Create JWT session token (same format as NextAuth)
    const token = await encode({
      token: {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        sub: owner.id,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: SESSION_MAX_AGE,
    });

    // Build the response
    const response = NextResponse.json({ success: true });

    // Set the session cookie
    response.cookies.set({
      name: "next-auth.session-token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
