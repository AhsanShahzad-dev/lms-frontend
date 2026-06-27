import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid announcement ID" }, { status: 400 });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
