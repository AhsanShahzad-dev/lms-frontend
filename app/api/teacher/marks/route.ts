import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, courseId, quizMarks, assignmentMarks, midsMarks, finalMarks } = body;

    const pStudentId = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
    const pCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;

    if (!pStudentId || !pCourseId) {
      return NextResponse.json({ message: "studentId and courseId are required" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (quizMarks !== undefined) dataToUpdate.quizMarks = quizMarks;
    if (assignmentMarks !== undefined) dataToUpdate.assignmentMarks = assignmentMarks;
    if (midsMarks !== undefined) dataToUpdate.midsMarks = midsMarks;
    if (finalMarks !== undefined) dataToUpdate.finalMarks = finalMarks;

    const marks = await prisma.marks.upsert({
      where: {
        studentId_courseId: {
          studentId: pStudentId,
          courseId: pCourseId,
        }
      },
      update: dataToUpdate,
      create: {
        studentId: pStudentId,
        courseId: pCourseId,
        quizMarks: quizMarks || 0,
        assignmentMarks: assignmentMarks || 0,
        midsMarks: midsMarks || 0,
        finalMarks: finalMarks || 0,
      }
    });

    return NextResponse.json(marks, { status: 201 });
  } catch (error) {
    console.error("Error submitting marks:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
