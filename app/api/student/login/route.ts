import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json({ message: "ID and password are required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
    });

    if (!student) {
      return NextResponse.json({ message: "Invalid ID or password" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid ID or password" }, { status: 401 });
    }

    // Prepare token payload
    const payload = {
      id: student.id,
      email: student.emailAddress,
      role: "STUDENT",
    };

    const token = await signJWT(payload);

    const response = NextResponse.json({
      message: "Login successful",
      token,
      email: student.emailAddress,
      role: "STUDENT",
      id: student.id,
    }, { status: 200 });

    // Set HTTP-only cookie as well for server-side usage if needed
    response.cookies.set("jwt_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Student login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
