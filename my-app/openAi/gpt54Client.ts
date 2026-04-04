import "server-only";
import { AzureOpenAI } from "openai";

let client: AzureOpenAI | null = null;

export function getAzureOpenAiClient(): AzureOpenAI {
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