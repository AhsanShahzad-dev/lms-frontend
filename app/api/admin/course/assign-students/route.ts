import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, studentIds } = body;

    if (!courseId || !Array.isArray(studentIds)) {
      return NextResponse.json({ message: "courseId and studentIds array are required" }, { status: 400 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(courseId, 10) },
      data: {
        students: {
          connect: studentIds.map(id => ({ id: parseInt(id, 10) }))
        }
      }
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error assigning students to course:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
