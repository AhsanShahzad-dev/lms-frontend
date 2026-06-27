import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, teacherId } = body;

    if (!courseId || !teacherId) {
      return NextResponse.json({ message: "courseId and teacherId are required" }, { status: 400 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(courseId, 10) },
      data: {
        teacherId: parseInt(teacherId, 10),
      }
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error assigning teacher to course:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
