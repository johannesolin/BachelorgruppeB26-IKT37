import { postEnvironmentResult } from "@/db/actions";
import { PostEnviromentResultsProps } from "@/db/types";
import { NextResponse } from "next/server";

export async function POST( req: Request) {
    try{
        const body = await req.json();
        
        const props: PostEnviromentResultsProps = {
            id: crypto.randomUUID(),
            category: body.category,
            prompt: body.prompt,
            imageString: body.imageString,
            model: body.model,
        }

        const result = await postEnvironmentResult(props);

        if(!result) return NextResponse.json({ error: "Storing of results failed"}, {status: 404});

        return NextResponse.json(result);

    } catch (e){
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }    
}