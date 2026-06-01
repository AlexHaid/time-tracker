import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

/** DELETE /api/entries/clear — Delete all entries for the authenticated user */
export async function DELETE() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.timeEntry.deleteMany({
    where: { userId },
  });

  return NextResponse.json({
    deleted: result.count,
  });
}
