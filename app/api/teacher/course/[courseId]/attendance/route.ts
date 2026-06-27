import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const courseId = parseInt(resolvedParams.courseId, 10);
    const body = await req.json();

    if (isNaN(courseId) || !Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
    }

    const date = new Date();
    
    // Create attendance records
    const attendancePromises = body.map((record: any) => 
      prisma.attendanceRecord.create({
        data: {
          studentId: typeof record.studentId === 'string' ? parseInt(record.studentId, 10) : record.studentId,
          courseId,
          present: record.present,
          date,
        }
      })
    );
    
    await Promise.all(attendancePromises);

    return NextResponse.json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
