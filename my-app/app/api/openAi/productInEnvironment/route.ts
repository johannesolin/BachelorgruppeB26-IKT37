import { base64ToBuffer } from "@/lib/base64ToBuffer";
import { linkToBuffer } from "@/lib/linkToBuffer";
import { addProductsToScene} from "@/openAi/client";
import { AddProductsToScene} from "@/openAi/types";
import { NextResponse } from "next/server";

export async function POST( req: Request) {
    try{
        const form = await req.formData();

        const prompt = String(form.get("prompt") ?? "").trim();
        const variants = String(form.get("variants") ?? "").trim();
        const productCount = Number(form.get("productCount") ?? "");
        const scene = String(form.get("scene") ?? "").trim();        
        const products = [];
        
        for(let i = 0; i < productCount; i++){
            products[i] =  await linkToBuffer(String(form.get(`product${i}`)));
        }        
        
        const sceneBuffer = base64ToBuffer(scene);
       
        const props: AddProductsToScene= {
        prompt: prompt,
        n: Number(variants),
        size: "1536x1024",          
        quality: "high",
        scene: sceneBuffer,
        products: products,      
        }
        
        const result = await addProductsToScene(props);
        if(!result || result.length === 0){
                    return NextResponse.json({ error: "No return image" }, { status: 204 });
        }
        
        return NextResponse.json(result);
    } catch (e){
        console.error(e);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}