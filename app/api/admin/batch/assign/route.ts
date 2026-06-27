import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Based on the frontend data, this could be BatchAssignData (studentIds, batch)
    // or AssignBatchToCourseData (courseId, batchId/batchName)
    // We can infer by checking the payload properties
    
    if (body.studentIds && body.batch) {
      // Assign multiple students to a batch
      const { studentIds, batch } = body;
      
      const updateResult = await prisma.student.updateMany({
        where: { id: { in: studentIds } },
        data: { batchName: batch }
      });
      
      return NextResponse.json({ message: "Students assigned to batch successfully", count: updateResult.count });
    } else if (body.courseId && body.batchId) {
      // Logic for assigning batch to a course (getting students in batch and linking to course)
      const { courseId, batchId } = body;
      
      // We assume batchId could be the batch name or ID, but in our schema, Batch uses 'name' as unique 
      // which is linked to students. We might need to get students by batch ID or name.
      const batchObj = typeof batchId === 'number' 
          ? await prisma.batch.findUnique({ where: { id: batchId } })
          : await prisma.batch.findUnique({ where: { name: batchId.toString() } });
          
      if (!batchObj) {
        return NextResponse.json({ message: "Batch not found" }, { status: 404 });
      }
      
      const studentsInBatch = await prisma.student.findMany({
        where: { batchName: batchObj.name }
      });
      
      if (studentsInBatch.length > 0) {
        await prisma.course.update({
          where: { id: parseInt(courseId, 10) },
          data: {
            students: {
              connect: studentsInBatch.map(s => ({ id: s.id }))
            }
          }
        });
      }
      
      return NextResponse.json({ message: "Batch assigned to course successfully" });
    }
    
    return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });

  } catch (error) {
    console.error("Error assigning batch:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
