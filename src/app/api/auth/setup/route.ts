import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Check if already set up
    const existing = await db.appSetting.findUnique({
      where: { key: "password_hash" },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Password already set up" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await hash(password, 12);

    // Store in DB
    await db.appSetting.create({
      data: { key: "password_hash", value: passwordHash },
    });

    // Auto-create a single owner user for all TimeEntry records
    const owner = await db.user.create({
      data: {
        email: "owner@local",
        name: "Owner",
        passwordHash,
      },
    });

    return NextResponse.json({ success: true, userId: owner.id });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
