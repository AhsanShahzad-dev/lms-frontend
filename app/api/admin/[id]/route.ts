import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const adminId = parseInt(resolvedParams.id, 10);

    if (isNaN(adminId)) {
      return NextResponse.json({ message: "Invalid admin ID" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    }

    const { password, ...adminProfile } = admin;
    return NextResponse.json(adminProfile);
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
