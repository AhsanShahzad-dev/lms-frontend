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

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      return NextResponse.json({ message: "Teacher not found" }, { status: 404 });
    }

    const { password, ...teacherProfile } = teacher;
    return NextResponse.json(teacherProfile);
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
