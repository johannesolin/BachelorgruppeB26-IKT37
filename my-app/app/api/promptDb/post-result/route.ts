import { postPromptResults } from "@/db/actions";
import { PromptResultsProps } from "@/db/types";
import { NextResponse } from "next/server";

export async function POST( req: Request) {
    try{
        const body = await req.json();

        const props: PromptResultsProps = {
            id: crypto.randomUUID(),
            productNames: body.productNames,
            productIds: body.productIds,
            imageLink: body.image,
            model: body.model,            
            prompt: body.prompt,
        };

        const result = await postPromptResults(props);

        if(!result) return NextResponse.json({ error: "Storing of results failed"}, {status: 404});

        return NextResponse.json(result);
        
    } catch (e){
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    
}