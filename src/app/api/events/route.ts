import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/events - List all events (public) or user's events (authenticated)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    const events = await db.event.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, date, location, category } = body;

    if (!title || !description || !date || !location) {
      return NextResponse.json(
        { error: "Title, description, date, and location are required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const event = await db.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        category: category || "general",
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
