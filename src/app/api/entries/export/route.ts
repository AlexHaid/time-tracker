import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

/** GET /api/entries/export — Export all entries as JSON */
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await db.timeEntry.findMany({
    where: { userId },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  // Group by date
  const entriesByDate: Record<string, Array<{
    id: string;
    name: string;
    description: string;
    spentMinutes: number;
    type: string;
  }>> = {};

  for (const entry of entries) {
    if (!entriesByDate[entry.date]) {
      entriesByDate[entry.date] = [];
    }
    entriesByDate[entry.date].push({
      id: entry.id,
      name: entry.name,
      description: entry.description,
      spentMinutes: entry.spentMinutes,
      type: entry.type,
    });
  }

  return NextResponse.json({
    entries: entriesByDate,
    version: 3,
  });
}
