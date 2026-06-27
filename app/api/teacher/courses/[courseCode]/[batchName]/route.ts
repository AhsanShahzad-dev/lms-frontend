import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseCode: string, batchName: string }> }
) {
  try {
    const resolvedParams = await params;
    const { courseCode, batchName } = resolvedParams;
    const decodedCourseCode = decodeURIComponent(courseCode);
    const decodedBatchName = decodeURIComponent(batchName);

    // Fetch the course and include students that belong to the specified batch
    const course = await prisma.course.findFirst({
      where: { courseNo: decodedCourseCode },
      include: {
        students: {
          where: { batchName: decodedBatchName },
          select: {
            id: true,
            name: true,
            regNo: true,
            emailAddress: true,
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // Format students according to frontend expected output (CourseStudent type if applicable)
    const formattedStudents = course.students.map(s => ({
      studentId: s.id,
      name: s.name,
      rollNo: s.regNo, // Depending on if rollNo is regNo
      regNo: s.regNo,
      email: s.emailAddress,
    }));

    // The frontend uses this same endpoint for both getTeacherCourseDetails and getStudentsByBatch.
    // Assuming we can return the course details enriched with formatted students.
    return NextResponse.json({
      ...course,
      students: formattedStudents,
    });
  } catch (error) {
    console.error("Error fetching course and batch details:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
