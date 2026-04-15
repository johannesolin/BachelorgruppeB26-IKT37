import { createImgFlux } from "@/flux2Pro/client";
import { FluxBody } from "@/flux2Pro/types";
import { base64LinkToBase64 } from "@/lib/helperFunctions/base64LinkToBase64";
import { NextResponse } from "next/server";

export async function POST( req: Request ) {
    try{
        const body = await req.json();

        const propmt = body.editResultPrompt;
        const scene =  body.scene;      
        
        const sceneBase64 = base64LinkToBase64(scene);

        const fluxBody: FluxBody = {
                prompt: propmt,
                width: "1536",
                height: "1024",
                seed: Math.floor(Math.random() * 10000),
                disable_pup: true,
                output_format: "jpeg",
                input_image: sceneBase64,
        };

        const result = await createImgFlux(fluxBody);
        if(!result || result.length === 0){
            return NextResponse.json({ error: "No return image" }, { status: 204 });
        }        

        return NextResponse.json(result);

    } catch (e){
        console.error(e);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
    
}