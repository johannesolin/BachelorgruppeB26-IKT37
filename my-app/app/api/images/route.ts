import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const path = request.nextUrl.searchParams.get("path");
    if (!path) {
        return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const host = process.env.DATABRICKS_SERVER_HOSTNAME;
    const token = process.env.DATABRICKS_TOKEN;

    if (!host || !token) {
        return NextResponse.json({ error: "Missing Databricks credentials" }, { status: 500 });
    }

    const url = `https://${host}/api/2.0/fs/files${path}`;

    try {
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
}
