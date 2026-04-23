/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/flux2Pro/client", () => ({
  createImgFlux: jest.fn(),
}));

import { POST } from "@/app/api/flux2Pro/generateEnvironment/route";
import { createImgFlux } from "@/flux2Pro/client";

const mockCreateImgFlux = createImgFlux as jest.MockedFunction<typeof createImgFlux>;

function makeFormRequest(fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  return new Request("http://localhost/", { method: "POST", body: form });
}

describe("POST /api/flux2Pro/generateEnvironment", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns the generated image on success", async () => {
    mockCreateImgFlux.mockResolvedValue("data:image/jpeg;base64,fluximg");
    const res = await POST(makeFormRequest({ prompt: "a garden", size: "1536x1024" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toBe("data:image/jpeg;base64,fluximg");
  });

  it("parses width and height from the size string", async () => {
    mockCreateImgFlux.mockResolvedValue("data:image/jpeg;base64,x");
    await POST(makeFormRequest({ prompt: "test", size: "1024x1536" }));
    expect(mockCreateImgFlux).toHaveBeenCalledWith(
      expect.objectContaining({ width: "1024", height: "1536" })
    );
  });

  it("passes the prompt to createImgFlux", async () => {
    mockCreateImgFlux.mockResolvedValue("data:image/jpeg;base64,x");
    await POST(makeFormRequest({ prompt: "sunny kitchen", size: "1024x1024" }));
    expect(mockCreateImgFlux).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "sunny kitchen" })
    );
  });

  it("returns 500 when createImgFlux throws", async () => {
    mockCreateImgFlux.mockRejectedValue(new Error("flux error"));
    const res = await POST(makeFormRequest({ prompt: "test", size: "1024x1024" }));
    expect(res.status).toBe(500);
  });
});
