import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teacher: { select: { id: true, name: true } },
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
