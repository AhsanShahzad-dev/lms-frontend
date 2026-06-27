import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseNo, courseName, credits } = body;

    if (!courseNo || !courseName || !credits) {
      return NextResponse.json({ message: "Course details are required" }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        courseNo,
        courseName,
        credits: parseInt(credits, 10),
      }
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
