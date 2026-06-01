import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const setting = await db.appSetting.findUnique({
    where: { key: "password_hash" },
  });

  return NextResponse.json({ isSetup: !!setting });
}
