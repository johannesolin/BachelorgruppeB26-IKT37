import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const folderPath = path.join(process.cwd(), "app", "templates");

    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ error: "Mappe mangler" }, { status: 404 });
    }

    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".json"));

    const templates = files.map((file) => {
      const filePath = path.join(folderPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      return {
        ...data,
        id: data.id || file.replace(".json", ""),
        name: data.name || file.replace(".json", ""),
        type: data.type || "hard",
      };
    });

    return NextResponse.json(templates);
  } catch (e) {
    return NextResponse.json([
      { id: "1", name: "Feil ved lesing", type: "error" },
    ]);
  }
}
