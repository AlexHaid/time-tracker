import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

/** POST /api/entries/import — Import entries from JSON */
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { entries } = body as {
      entries: Record<string, Array<{
        name: string;
        description?: string;
        spentMinutes: number;
        type?: string;
      }>>;
    };

    if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
      return NextResponse.json(
        { error: "Invalid format: entries must be a date-keyed object" },
        { status: 400 }
      );
    }

    // Validate and collect all entries
    const toCreate: Array<{
      name: string;
      description: string;
      date: string;
      spentMinutes: number;
      type: string;
      userId: string;
    }> = [];

    for (const [date, list] of Object.entries(entries)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { error: `Invalid date key: ${date}` },
          { status: 400 }
        );
      }
      if (!Array.isArray(list)) {
        return NextResponse.json(
          { error: `Entries for ${date} must be an array` },
          { status: 400 }
        );
      }
      for (const entry of list) {
        if (!entry.name || typeof entry.spentMinutes !== "number") {
          return NextResponse.json(
            { error: `Invalid entry in ${date}: name and spentMinutes are required` },
            { status: 400 }
          );
        }
        toCreate.push({
          name: entry.name,
          description: entry.description || "",
          date,
          spentMinutes: entry.spentMinutes,
          type: entry.type || "development",
          userId,
        });
      }
    }

    // Create all entries in a transaction
    await db.$transaction(
      toCreate.map((data) => db.timeEntry.create({ data }))
    );

    return NextResponse.json({
      imported: toCreate.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import entries" },
      { status: 500 }
    );
  }
}
