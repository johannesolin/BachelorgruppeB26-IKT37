import "server-only";
import { AzureOpenAI } from "openai";
import { GenerateImg } from "./types";

let client: AzureOpenAI | null = null;

export function getAzureOpenAiClient(): AzureOpenAI {
    if(client){
        return client;
    }
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
    const deployment = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT;

    if (!endpoint || !apiKey || !apiVersion || !deployment) {
    throw new Error(
      "Missing Azure OpenAI env vars (AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_VERSION, AZURE_OPENAI_IMAGE_DEPLOYMENT)."
    );
    }
    client = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment,
    });

    return client;
}

export async function generateImg(props: GenerateImg){
    const client: AzureOpenAI = getAzureOpenAiClient();
    console.log(props.prompt, props.n, props.quality, props.size)
    const img = await client.images.generate({
        model: "gpt-image-1.5",
        prompt: props.prompt,
        n: props.n,
        size: props.size,
        quality: props.quality,
        output_format: "jpeg",
    });

    const base64String = img.data?.[0].b64_json;

    if(!base64String){
        throw new Error("No image returned, data[0].b64_json missing")
    }     

    return base64String;
}

export async function editSceneImg() {
    
}