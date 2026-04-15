import { base64ToBuffer } from "@/lib/helperFunctions/base64ToBuffer";
import { editImg } from "@/openAi/client";
import { EditImg } from "@/openAi/types";
import { NextResponse } from "next/server";

export async function POST( req: Request ) {
    try{
        const body = await req.json();

        const propmt = body.editResultPrompt;
        const scene =  body.scene;

        const sceneBuffer = base64ToBuffer(scene);

        const props: EditImg = {
            prompt: propmt,
            n: 1,
            size: "1536x1024",
            quality: "high",
            scene: sceneBuffer,

        }

        const result = await editImg(props);
        if(!result || result.length === 0){
                    return NextResponse.json({ error: "No return image" }, { status: 204 });
        }
        
        return NextResponse.json(result);

    } catch (e) {
        console.error(e);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
    
}