import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Hash default password if one is provided, otherwise create one or fail
    const password = body.password ? await bcrypt.hash(body.password, 10) : await bcrypt.hash("password123", 10);

    const student = await prisma.student.create({
      data: {
        id: body.id,
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
        cgpa: body.cgpa || 0.0,
        wifiAccount: body.wifiAccount || "",
        office365Email: body.office365Email || "",
        office365Pass: body.office365Pass || "",
        batchName: body.batch || body.batchName || "Unknown",
        password,
      }
    });

    const { password: _, ...studentResponse } = student;
    return NextResponse.json(studentResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
