import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filename = searchParams.get("path");
        if (!filename) {
            return NextResponse.json({ message: "Missing path parameter" }, { status: 400 });
        }

        // Clean filename to prevent directory traversal
        const cleanFilename = filename.split(/[/\\]/).pop() || filename;
        const filePath = join(process.cwd(), "public", "uploads", cleanFilename);

        if (!existsSync(filePath)) {
            return NextResponse.json({ message: "File not found" }, { status: 404 });
        }

        const fileBuffer = await readFile(filePath);
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${cleanFilename}"`,
            },
        });
    } catch (error: any) {
        console.error("Download error:", error);
        return NextResponse.json({ message: "Download failed", error: error.message }, { status: 500 });
    }
}
