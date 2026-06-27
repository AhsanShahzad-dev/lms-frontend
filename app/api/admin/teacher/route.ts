import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const password = body.password ? await bcrypt.hash(body.password, 10) : await bcrypt.hash("password123", 10);

    // Use a provided ID or generate a default random integer ID since Teacher ID is not auto-incrementing in schema
    const id = body.id || Math.floor(Math.random() * 100000);

    const teacher = await prisma.teacher.create({
      data: {
        id,
        name: body.name,
        regNo: body.regNo,
        emailAddress: body.emailAddress,
        contactNumber: body.contactNumber,
        guardianNumber: body.guardianNumber,
        fatherName: body.fatherName,
        program: body.program,
        session: body.session,
        semester: body.semester,
        campus: body.campus,
        className: body.className,
        nationality: body.nationality,
        dob: body.dob,
        profilePic: body.profilePic,
        qualification: body.qualification,
        specialization: body.specialization,
        password,
      }
    });

    const { password: _, ...teacherResponse } = teacher;
    return NextResponse.json(teacherResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
