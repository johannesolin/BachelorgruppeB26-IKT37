import { buildSystemPrompt } from "@/lib/helperFunctions/buildSystemPrompt";
import { buildUserPrompt } from "@/lib/helperFunctions/buildUserPrompt";
import { gpt54PlacementSuggestionsRequest } from "@/openAi/gpt54Client";
import { NextResponse } from "next/server";

export async function POST( req: Request ){
    try{
        const body = await req.json();

        const selectedModel = body.selectedModel;
        const scenePrompt = body.scenePrompt;
        const productSummary = body.productSummary;
        
        const systemInput = buildSystemPrompt(selectedModel);
        const userInput = buildUserPrompt(scenePrompt, productSummary);

        const result = await gpt54PlacementSuggestionsRequest(systemInput, userInput);
        
        if(!result || result.length === 0){
            return NextResponse.json({ error: "No return text from modell" }, { status: 204 });
        }

        return NextResponse.json(result);

    } catch (e){
        console.error(e);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}