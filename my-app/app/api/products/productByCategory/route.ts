import { getProductByCategory } from "@/db/actions";
import { NextResponse } from "next/server";

export async function POST( req: Request) {
    try{
        const body = await req.json();

        const result = await getProductByCategory( { area: body.area, category: body.category, assortment: body.assortment})

        if(!result) return NextResponse.json({ error: "No product found"}, { status: 404});
        
        return NextResponse.json(result);

    } catch (e){
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}