import { createImgFlux } from "@/flux2Pro/client";
import { FluxBody } from "@/flux2Pro/types";
import { base64LinkToBase64 } from "@/lib/helperFunctions/base64LinkToBase64";
import { linkToBase64 } from "@/lib/helperFunctions/linkToBase64";
import { NextResponse } from "next/server";

export async function POST( req: Request){
    try{
            const form = await req.formData();

            const prompt = String(form.get("prompt") ?? "").trim();
            const productCount = Number(form.get("productCount") ?? "");
            const scene = String(form.get("scene") ?? "").trim();
            const variants = Number(form.get("variants") ?? "");     
            
            const products: Record< string, string > = {}

            for(let i = 0; i < productCount; i++){
                const keyName = "input_image_" + (i+2);           
                products[keyName] = await linkToBase64(String(form.get(`product${i}`)))
            }                       

            const sceneBase64 = base64LinkToBase64(scene);
            
            const results: Array<string> = [];

            for(let i = 0; i < variants; i++){
                const body: FluxBody = {
                    prompt: prompt,
                    width: "1536",
                    height: "1024",
                    seed: Math.floor(Math.random() * 10000),
                    disable_pup: true,
                    output_format: "jpeg",
                    input_image: sceneBase64,
                    ...products
                };
        
                const result = await createImgFlux(body);                
                if(!result || result.length ===0){
                    console.error("No return image on variant " + (i+1));
                }
                results.push(result);
            }

            if(!results || results.length === 0){
                    return NextResponse.json({ error: "No return images" }, { status: 204 });
            }
    
            return NextResponse.json(results);
    
        } catch (e){
            console.error(e);
            return NextResponse.json({error: "Internal server error"}, {status: 500});
        }
}