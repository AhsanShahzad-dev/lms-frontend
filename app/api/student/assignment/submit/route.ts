import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { studentId, assignmentId, fileUrl } = body;

    // Convert to numbers if they are passed as strings
    studentId = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
    assignmentId = typeof assignmentId === 'string' ? parseInt(assignmentId, 10) : assignmentId;

    if (!studentId || !assignmentId || !fileUrl) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const submission = await prisma.submission.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        }
      },
      update: {
        fileUrl,
        submittedAt: new Date(),
      },
      create: {
        studentId,
        assignmentId,
        fileUrl,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
