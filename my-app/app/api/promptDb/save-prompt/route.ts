import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PROMPTS_FILE = path.join(process.cwd(), "data", "saved_prompts.json");

async function readPrompts(): Promise<object[]> {
    try {
        const content = await fs.readFile(PROMPTS_FILE, "utf-8");
        return JSON.parse(content);
    } catch {
        return [];
    }
}

async function writePrompts(prompts: object[]): Promise<void> {
    await fs.mkdir(path.dirname(PROMPTS_FILE), { recursive: true });
    await fs.writeFile(PROMPTS_FILE, JSON.stringify(prompts, null, 2), "utf-8");
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.prompt?.trim()) {
            return NextResponse.json({ error: "Prompt mangler" }, { status: 400 });
        }

        const prompts = await readPrompts();
        prompts.unshift({
            id: crypto.randomUUID(),
            created: new Date().toISOString(),
            prompt: body.prompt.trim(),
            model: body.model || "",
            prompt_type: body.promptType || "ukjent",
        });

        await writePrompts(prompts);
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
