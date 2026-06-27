import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const teacherId = parseInt(resolvedParams.id, 10);

    if (isNaN(teacherId)) {
      return NextResponse.json({ message: "Invalid teacher ID" }, { status: 400 });
    }

    const courses = await prisma.course.findMany({
      where: { teacherId },
      include: {
        students: { select: { id: true } },
        announcements: {
          orderBy: {
            timestamp: 'desc'
          }
        },
        learningResources: true,
        assignments: true,
      }
    });

    // Map Prisma format to Frontend expected format
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      courseNo: course.courseNo,
      courseName: course.courseName,
      credits: course.credits,
      teacherId: course.teacherId,
      studentIds: course.students.map(s => s.id),
      announcements: course.announcements,
      learningResources: course.learningResources,
      assignments: course.assignments,
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error("Error fetching teacher courses:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
