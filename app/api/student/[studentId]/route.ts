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

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    const { password, ...studentProfile } = student;
    return NextResponse.json(studentProfile);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
