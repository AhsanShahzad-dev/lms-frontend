import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, dueDate, courseId, teacherId } = body; 
    
    const parsedCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;

    if (!title || !description || !dueDate || !parsedCourseId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        courseId: parsedCourseId,
      }
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
