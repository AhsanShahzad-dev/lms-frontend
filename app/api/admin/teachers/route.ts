import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        regNo: true,
        emailAddress: true,
        contactNumber: true,
        guardianNumber: true,
        fatherName: true,
        program: true,
        session: true,
        semester: true,
        campus: true,
        className: true,
        nationality: true,
        dob: true,
        profilePic: true,
        qualification: true,
        specialization: true,
        // Exclude password
      }
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
