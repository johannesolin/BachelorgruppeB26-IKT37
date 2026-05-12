import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PROMPTS_FILE = path.join(process.cwd(), "data", "saved_prompts.json");

export async function GET() {
    try {
        const content = await fs.readFile(PROMPTS_FILE, "utf-8");
        return NextResponse.json(JSON.parse(content));
    } catch {
        return NextResponse.json([]);
    }
}
