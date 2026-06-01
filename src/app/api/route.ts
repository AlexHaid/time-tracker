import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Quick DB connectivity check
    await db.appSetting.count();
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "error", message: "Database connection failed" },
      { status: 503 }
    );
  }
}
