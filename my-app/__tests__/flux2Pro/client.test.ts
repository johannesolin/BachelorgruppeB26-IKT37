/** @jest-environment node */
jest.mock("server-only", () => ({}));

process.env.AZURE_FOUNDRY_FLUX2PRO_URL = "https://test.flux.api/generate";
process.env.AZURE_FOUNDRY_FLUX2PRO_APIKEY = "flux-test-key";
process.env.AZURE_FOUNDRY_MODEL_FLUX2 = "flux-2-pro";

import { getFluxClient, createImgFlux } from "@/flux2Pro/client";

describe("getFluxClient", () => {
  it("returns a client object with url, apiKey, and model", () => {
    const client = getFluxClient();
    expect(client.url).toBe("https://test.flux.api/generate");
    expect(client.apiKey).toBe("flux-test-key");
    expect(client.model).toBe("flux-2-pro");
  });
});

describe("createImgFlux", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns a data URL prefixed base64 string", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve(JSON.stringify({
        data: [{ b64_json: "fluxresult" }],
      })),
    } as unknown as Response);

    const result = await createImgFlux({
      prompt: "garden scene",
      width: "1536",
      height: "1024",
      seed: 42,
      disable_pup: true,
      output_format: "jpeg",
    });
    expect(result).toBe("data:image/jpeg;base64,fluxresult");
  });

  it("sends a POST request with Authorization header", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve(JSON.stringify({ data: [{ b64_json: "x" }] })),
    } as unknown as Response);

    await createImgFlux({ prompt: "test", width: "1024", height: "1024", seed: 1, disable_pup: true, output_format: "jpeg" });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://test.flux.api/generate",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer flux-test-key" }),
      })
    );
  });

  it("includes the model in the request body", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve(JSON.stringify({ data: [{ b64_json: "x" }] })),
    } as unknown as Response);

    await createImgFlux({ prompt: "test", width: "1024", height: "1024", seed: 1, disable_pup: true, output_format: "jpeg" });

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(callBody.model).toBe("flux-2-pro");
  });

  it("throws when b64_json is missing in the response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve(JSON.stringify({ data: [{}] })),
    } as unknown as Response);

    await expect(
      createImgFlux({ prompt: "test", width: "1024", height: "1024", seed: 1, disable_pup: true, output_format: "jpeg" })
    ).rejects.toThrow("No image returned");
  });
});
