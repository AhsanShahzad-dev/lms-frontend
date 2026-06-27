import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const students = await prisma.student.findMany({
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
        cgpa: true,
        wifiAccount: true,
        office365Email: true,
        office365Pass: true,
        batchName: true,
        // Exclude password
      }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
