import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/api-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET /api/entries/[id] — Get a single entry */
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const entry = await db.timeEntry.findUnique({
    where: { id },
  });

  if (!entry || entry.userId !== userId) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: entry.id,
    name: entry.name,
    description: entry.description,
    date: entry.date,
    spentMinutes: entry.spentMinutes,
    type: entry.type,
  });
}

/** PUT /api/entries/[id] — Update an entry */
export async function PUT(req: NextRequest, context: RouteContext) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  // Verify ownership
  const existing = await db.timeEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { name, description, date, spentMinutes, type } = body;

    const updateData: {
      name?: string;
      description?: string;
      date?: string;
      spentMinutes?: number;
      type?: string;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { error: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }
      updateData.date = date;
    }
    if (spentMinutes !== undefined) updateData.spentMinutes = spentMinutes;
    if (type !== undefined) updateData.type = type;

    const updated = await db.timeEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      date: updated.date,
      spentMinutes: updated.spentMinutes,
      type: updated.type,
    });
  } catch (error) {
    console.error("Update entry error:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

/** DELETE /api/entries/[id] — Delete an entry */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  // Verify ownership
  const existing = await db.timeEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  await db.timeEntry.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
