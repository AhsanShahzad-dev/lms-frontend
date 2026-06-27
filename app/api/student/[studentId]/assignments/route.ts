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

    const studentWithCourses = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        courses: { select: { id: true } }
      }
    });

    if (!studentWithCourses) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    const courseIds = studentWithCourses.courses.map(c => c.id);

    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
    });

    const submissions = await prisma.submission.findMany({
      where: { 
        studentId, 
        assignmentId: { in: assignments.map(a => a.id) } 
      }
    });

    const submissionMap = new Map(submissions.map(s => [s.assignmentId, s]));

    const result = assignments.map(a => {
      const sub = submissionMap.get(a.id);
      let status = "pending";
      
      const now = new Date();
      if (sub) {
        status = sub.submittedAt > a.dueDate ? "late" : "submitted";
      } else if (now > a.dueDate) {
        status = "late"; // or pending based on frontend, but "late" makes sense for overdue unsubmitted
      }

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate.toISOString(),
        teacherFileUrl: a.teacherFileUrl,
        teacherSubmitted: !!a.teacherFileUrl,
        studentSubmissionFileUrl: sub ? sub.fileUrl : null,
        status,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
