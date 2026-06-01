import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Clear all NextAuth cookies by setting them to expire in the past
  response.cookies.set({
    name: "next-auth.session-token",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: "next-auth.callback-url",
    value: "",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: "next-auth.csrf-token",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
