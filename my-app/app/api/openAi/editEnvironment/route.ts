import { base64ToBuffer } from "@/lib/helperFunctions/base64ToBuffer";
import { editImg } from "@/openAi/client";
import { EditImg, Quality, Size } from "@/openAi/types";
import { NextResponse } from "next/server";

export async function POST( req: Request) {
    try{
        const form = await req.formData();

        const prompt = String(form.get("prompt") ?? "").trim();
        const size = String(form.get("size") ?? "").trim() as Size;
        const quality = String(form.get("quality") ?? "").trim() as Quality;
        const scene = String(form.get("scene") ?? "").trim();

        const sceneBuffer = base64ToBuffer(scene);

        const props: EditImg = {
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality,
        scene: sceneBuffer,       
        }
        
        const result = await editImg(props);
        if(!result || result.length === 0){
                    return NextResponse.json({ error: "No return image" }, { status: 204 });
        }
        
        return NextResponse.json(result); 
    } catch (e){
        console.error(e);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}