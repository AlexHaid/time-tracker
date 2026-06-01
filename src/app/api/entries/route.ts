import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

/** GET /api/entries — Get all entries for the authenticated user, optionally filtered by month */
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // e.g. "2025-03"

  let where: { userId: string; date?: { startsWith: string } } = { userId };

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    where.date = { startsWith: month };
  }

  const entries = await db.timeEntry.findMany({
    where,
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  // Group by date for the frontend EntriesByDate format
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

  return NextResponse.json({ entries: entriesByDate });
}

/** POST /api/entries — Create one or more time entries */
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { entries } = body as {
      entries: Array<{
        name: string;
        description?: string;
        date: string;
        spentMinutes: number;
        type: string;
      }>;
    };

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Entries array is required" },
        { status: 400 }
      );
    }

    // Validate each entry
    for (const entry of entries) {
      if (!entry.name || !entry.date || !entry.spentMinutes || !entry.type) {
        return NextResponse.json(
          { error: "Each entry must have name, date, spentMinutes, and type" },
          { status: 400 }
        );
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
        return NextResponse.json(
          { error: `Invalid date format: ${entry.date}. Use YYYY-MM-DD` },
          { status: 400 }
        );
      }
    }

    const created = await db.$transaction(
      entries.map((entry) =>
        db.timeEntry.create({
          data: {
            name: entry.name,
            description: entry.description || "",
            date: entry.date,
            spentMinutes: entry.spentMinutes,
            type: entry.type,
            userId,
          },
        })
      )
    );

    return NextResponse.json(
      {
        entries: created.map((e) => ({
          id: e.id,
          name: e.name,
          description: e.description,
          date: e.date,
          spentMinutes: e.spentMinutes,
          type: e.type,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create entries error:", error);
    return NextResponse.json(
      { error: "Failed to create entries" },
      { status: 500 }
    );
  }
}
