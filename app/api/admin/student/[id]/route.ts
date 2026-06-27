import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const studentId = parseInt(resolvedParams.id, 10);

    if (isNaN(studentId)) {
      return NextResponse.json({ message: "Invalid student ID" }, { status: 400 });
    }

    await prisma.student.delete({
      where: { id: studentId },
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
