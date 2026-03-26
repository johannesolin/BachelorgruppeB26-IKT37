import "server-only";
import { AzureOpenAI, toFile } from "openai";
import { EditImg, GenerateImg } from "./types";

let client: AzureOpenAI | null = null;

export function getAzureOpenAiClient(): AzureOpenAI {
    if(client) return client;

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
    const img = await client.images.generate({
        prompt: props.prompt,
        n: props.n,
        size: props.size,
        quality: props.quality,
        output_format: "jpeg",
    });

    let base64String = img.data?.[0].b64_json;

    if(!base64String){
        throw new Error("No image returned, data[0].b64_json missing");
    }
    
    base64String = "data:image/jpeg;base64," + base64String;

    return base64String;
}

export async function editImg(props: EditImg) {
    const client: AzureOpenAI = getAzureOpenAiClient();
    const image = await toFile(props.images, "scene.jpeg", { type: "image/jpeg" });
    const img = await client.images.edit({
        image: [image],
        size: props.size,
        prompt: props.prompt,
        n: props.n,        
        quality: props.quality,
        output_format: "jpeg",
        input_fidelity: "high"
    });

    let base64String = img.data?.[0].b64_json;

    if(!base64String){
        throw new Error("No image returned, data[0].b64_json missing");
    }

    base64String = "data:image/jpeg;base64," + base64String;

    return base64String;
}