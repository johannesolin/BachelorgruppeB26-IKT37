import { postPromptResults } from "@/db/actions";
import { PromptResultsProps } from "@/db/types";
import { NextResponse } from "next/server";

export async function POST( req: Request) {
    try{
        const body = await req.json();

        const date = new Date();

        const props: PromptResultsProps = {
            id: crypto.randomUUID(),
            created: date,
            productNames: body.productNames,
            productIds: body.productIds,
            imageLink: body.image,
            model: body.model,            
            miljoPrompt: body.miljoPrompt,
            miljoEditPrompts: body.miljoEditPrompts,
            imagePrompt: body.imagePrompt,
            imageEditPrompts: body.imageEditPrompts,
        }

        const result = await postPromptResults(props);
        
    } catch (e){
        console.error(e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    
}