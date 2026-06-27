import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, message } = body;
    
    const parsedCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;

    if (!parsedCourseId || !message) {
      return NextResponse.json({ message: "Course ID and message are required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        courseId: parsedCourseId,
        message,
      }
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
