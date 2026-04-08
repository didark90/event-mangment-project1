import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const contactMessage = await db.contactMessage.create({
      data: { name, email, subject, message },
    });

    return NextResponse.json(
      {
        message: "Your message has been sent successfully! We'll get back to you soon.",
        contactMessage: {
          id: contactMessage.id,
          name: contactMessage.name,
          subject: contactMessage.subject,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Get contact messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
