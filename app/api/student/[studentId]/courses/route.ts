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
        courses: {
          include: {
            students: { select: { id: true } },
            announcements: true,
            learningResources: true,
            assignments: {
              include: {
                submissions: {
                  where: { studentId: studentId }
                }
              }
            },
          }
        }
      }
    });

    if (!studentWithCourses) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Map Prisma format to Frontend expected format
    const courses = studentWithCourses.courses.map((course) => {
      const mappedAssignments = course.assignments.map(assignment => {
        const submission = assignment.submissions[0]; // because we filtered by studentId
        let status = "pending";
        if (submission) {
          status = "submitted";
        } else if (new Date(assignment.dueDate) < new Date()) {
          status = "late";
        }

        return {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          teacherFileUrl: assignment.teacherFileUrl,
          teacherSubmitted: !!assignment.teacherFileUrl,
          studentSubmissionFileUrl: submission ? submission.fileUrl : null,
          status: status
        };
      });

      return {
        id: course.id,
        courseNo: course.courseNo,
        courseName: course.courseName,
        credits: course.credits,
        teacherId: course.teacherId,
        studentIds: course.students.map(s => s.id),
        announcements: course.announcements,
        learningResources: course.learningResources,
        assignments: mappedAssignments,
      };
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching student courses:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
