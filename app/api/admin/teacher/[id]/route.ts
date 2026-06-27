import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const teacherId = parseInt(resolvedParams.id, 10);

    if (isNaN(teacherId)) {
      return NextResponse.json({ message: "Invalid teacher ID" }, { status: 400 });
    }

    await prisma.teacher.delete({
      where: { id: teacherId },
    });

    return NextResponse.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
