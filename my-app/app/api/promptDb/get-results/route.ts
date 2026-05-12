import { getEnvironmentResults, getProductPlacementResults } from "@/db/actions";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [envResults, placementResults] = await Promise.all([
            getEnvironmentResults(),
            getProductPlacementResults(),
        ]);
        return NextResponse.json({ envResults, placementResults });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
