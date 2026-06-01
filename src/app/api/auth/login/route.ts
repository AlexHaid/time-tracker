import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { encode } from "next-auth/jwt";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT session token (same format as NextAuth)
    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        sub: user.id,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: SESSION_MAX_AGE,
    });

    // Determine the correct host from proxy headers
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const host = req.headers.get("host");
    const effectiveHost = forwardedHost || host || "localhost";
    const effectiveProto =
      forwardedProto || (effectiveHost.startsWith("localhost") ? "http" : "https");

    // Build the response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    // Set the session cookie with the correct same attributes as NextAuth
    response.cookies.set({
      name: "next-auth.session-token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
      secure: effectiveProto === "https",
    });

    // Also set the callback-url cookie to help NextAuth know the correct origin
    const callbackUrl = `${effectiveProto}://${effectiveHost}`;
    response.cookies.set({
      name: "next-auth.callback-url",
      value: callbackUrl,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
      secure: effectiveProto === "https",
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
