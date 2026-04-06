import { createImgFlux } from "@/flux2Pro/client";
import { FluxBody } from "@/flux2Pro/types";
import { getWidthHeight } from "@/lib/helperFunctions/getWidthHeight";
import { NextResponse } from "next/server";

export async function POST( req: Request){
    try{
        const form = await req.formData();

        const prompt = String(form.get("prompt") ?? "").trim();
        const size = String(form.get("size") ?? "").trim();
        const {width, height} = getWidthHeight(size);

        const body: FluxBody = {
            prompt: prompt,
            width,
            height,
            disable_pup: true,
            output_format: "jpeg",
        };

        const result = await createImgFlux(body);
        if(!result || result.length === 0){
            return NextResponse.json({ error: "No return image" }, { status: 204 });
        }

        return NextResponse.json(result);

    } catch (e){
        console.error(e);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }    
}