import "server-only";
import { AzureOpenAI } from "openai";

let client: AzureOpenAI | null = null;

function getAzureOpenAiClient(): AzureOpenAI {
    if(client) return client;

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION_GPT54;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_GPT54;

    if (!endpoint || !apiKey || !apiVersion || !deployment) throw new Error("Missing Azure OpenAI .env variables.");

    client = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment,
    });

    return client;
}

export async function gpt54PlacementSuggestionsRequest( systemInput: string, userInput: string ){
    const client = getAzureOpenAiClient();
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_GPT54;

    const response = await client.responses.create({
        model: deployment,
        input: [ 
            {role: "system", content: systemInput},
            {role: "user", content: userInput},
        ]
    });

    const text = response.output_text.trim()
    if(!text) throw new Error("Språkmodellen returnerte tom tekst.");

    return text;
}

