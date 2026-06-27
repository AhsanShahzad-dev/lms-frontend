import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define upload directory inside public
        const uploadDir = join(process.cwd(), "public", "uploads");

        // Ensure upload directory exists
        await mkdir(uploadDir, { recursive: true });

        // Save file with a unique name to prevent collisions
        const uniqueFilename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const filePath = join(uploadDir, uniqueFilename);
        await writeFile(filePath, buffer);

        // The Spring Boot backend returned just the filename string in text format
        return new NextResponse(uniqueFilename, {
            status: 200,
            headers: {
                "Content-Type": "text/plain"
            }
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Upload failed", error: error.message }, { status: 500 });
    }
}
