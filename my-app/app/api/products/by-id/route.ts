import { getProductById } from "@/db/actions"
import { NextResponse } from "next/server";

export async function POST( req: Request ){    
    try{
        const body = await req.json();
        const productId = body.id;
        
        if(!productId){
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }
        
        const result = await getProductById(productId);
        if(!result || result.length === 0){
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        // Opprettelse av variabel for valg av bilde til innsending til modellene.
        result[0].selectedImage = 0;
        return NextResponse.json(result[0])
    } catch (e){
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}