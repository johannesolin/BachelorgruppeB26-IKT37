import "server-only";
import { FluxBody, FluxClient, FluxRespons } from "./types";

let client: FluxClient | null = null;

export function getFluxClient(): FluxClient {
  if(client) return client;

  const url = process.env.AZURE_FOUNDRY_FLUX2PRO_URL;
  const apiKey = process.env.AZURE_FOUNDRY_FLUX2PRO_APIKEY;
  const model = process.env.AZURE_FOUNDRY_MODEL_FLUX2;

  if(!url || !apiKey || !model) throw new Error("Missing .env variable for Flux client");  

  client = {
    url,
    apiKey,
    model,
  }

  return client;
}

export async function createImgFlux( body: FluxBody ): Promise<string>{
  const { url, apiKey, model } = getFluxClient();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({model, ...body})
  });

  const json = await JSON.parse(await response.text()) as FluxRespons;

  let base64String = json.data[0].b64_json;

  if(!base64String) throw new Error("No image returned, data[0].b64_json missing");

  base64String = "data:image/jpeg;base64," + base64String;

  return base64String;
}