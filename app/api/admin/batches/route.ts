import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
