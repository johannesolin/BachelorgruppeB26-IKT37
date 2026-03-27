import { getProductById } from "@/db/actions"
import { NextResponse } from "next/server";

export async function GET( req: Request ){    
    try{
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId")?.trim() ?? "";
    
     if(!productId){
        return NextResponse.json({ error: "Missing productId" }, { status: 400 });
     }
    
    const result = await getProductById(productId);
    if(!result || result.length === 0){
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    result[0].selectedImage = 0;
    console.log(result)
    return NextResponse.json(result[0])
    } catch (e){
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}