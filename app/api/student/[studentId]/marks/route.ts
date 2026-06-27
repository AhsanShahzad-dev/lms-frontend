import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const resolvedParams = await params;
    const studentId = parseInt(resolvedParams.studentId, 10);

    if (isNaN(studentId)) {
      return NextResponse.json({ message: "Invalid student ID" }, { status: 400 });
    }

    const marks = await prisma.marks.findMany({
      where: { studentId },
      include: {
        course: { select: { courseName: true } }
      }
    });

    const marksData = marks.map(m => ({
      courseId: m.courseId,
      courseName: m.course.courseName,
      quizMarks: m.quizMarks,
      assignmentMarks: m.assignmentMarks,
      midsMarks: m.midsMarks,
      finalMarks: m.finalMarks,
    }));

    return NextResponse.json(marksData);
  } catch (error) {
    console.error("Error fetching student marks:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
