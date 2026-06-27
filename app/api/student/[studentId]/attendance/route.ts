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

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        course: { select: { courseName: true } }
      }
    });

    // Structure expected by frontend
    const statsMap: Record<number, any> = {};

    attendanceRecords.forEach(record => {
      if (!statsMap[record.courseId]) {
        statsMap[record.courseId] = {
          courseId: record.courseId,
          courseName: record.course.courseName,
          totalClasses: 0,
          presents: 0,
          absents: 0,
        };
      }

      statsMap[record.courseId].totalClasses += 1;
      if (record.present) {
        statsMap[record.courseId].presents += 1;
      } else {
        statsMap[record.courseId].absents += 1;
      }
    });

    return NextResponse.json(Object.values(statsMap));
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
