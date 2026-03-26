import "server-only";

export type FluxClientConfig = {
  baseUrl: string;
  apiKey: string;
  apiVersion: string;
  endpointPath: string;
  model: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getFluxConfig(): FluxClientConfig {
  const baseUrl = requireEnv("AZURE_FOUNDRY_BASE_URL_FLUX2");
  const apiKey = requireEnv("AZURE_FOUNDRY_API_KEY_FLUX2");
  const apiVersion = requireEnv("AZURE_FOUNDRY_API_VERSION_FLUX2");
  const endpointPath = requireEnv("AZURE_FOUNDRY_PATH_FLUX2");
  const model = requireEnv("AZURE_FOUNDRY_MODEL_FLUX2");

  return {
    baseUrl,
    apiKey,
    apiVersion,
    endpointPath,
    model,
  };
}

export function buildFluxUrl(): string {
  const { baseUrl, apiVersion, endpointPath } = getFluxConfig();
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const url = new URL(endpointPath.replace(/^\//, ""), normalizedBase);
  url.searchParams.set("api-version", apiVersion);
  return url.toString();
}