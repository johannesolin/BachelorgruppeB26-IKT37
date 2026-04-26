import { NextResponse } from "next/server";

export async function POST( req: Request) {
    try{
        const body = await req.json();
        
    } catch (e){
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    
}