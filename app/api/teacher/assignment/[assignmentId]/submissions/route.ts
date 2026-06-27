import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const resolvedParams = await params;
    const assignmentId = parseInt(resolvedParams.assignmentId, 10);

    if (isNaN(assignmentId)) {
      return NextResponse.json({ message: "Invalid assignment ID" }, { status: 400 });
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: { name: true, regNo: true }
        }
      }
    });

    const result = submissions.map(sub => ({
      ...sub,
      studentName: sub.student.name,
      studentRegNo: sub.student.regNo,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
