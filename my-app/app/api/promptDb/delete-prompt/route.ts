import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PROMPTS_FILE = path.join(process.cwd(), "data", "saved_prompts.json");

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        const content = await fs.readFile(PROMPTS_FILE, "utf-8");
        const prompts = JSON.parse(content);
        const filtered = prompts.filter((p: { id: string }) => p.id !== id);
        await fs.writeFile(PROMPTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
