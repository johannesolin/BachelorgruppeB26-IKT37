/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/openAi/client", () => ({
  generateImg: jest.fn(),
}));

import { POST } from "@/app/api/openAi/generateEnvironment/route";
import { generateImg } from "@/openAi/client";

const mockGenerateImg = generateImg as jest.MockedFunction<typeof generateImg>;

function makeFormRequest(fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  return new Request("http://localhost/api/openAi/generateEnvironment", {
    method: "POST",
    body: form,
  });
}

describe("POST /api/openAi/generateEnvironment", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns the generated image string on success", async () => {
    mockGenerateImg.mockResolvedValue("data:image/jpeg;base64,abc123");
    const res = await POST(makeFormRequest({ prompt: "a kitchen", size: "1024x1024", quality: "high" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toBe("data:image/jpeg;base64,abc123");
  });

  it("passes prompt, size, and quality to generateImg", async () => {
    mockGenerateImg.mockResolvedValue("data:image/jpeg;base64,x");
    await POST(makeFormRequest({ prompt: "garden", size: "1536x1024", quality: "medium" }));
    expect(mockGenerateImg).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "garden", size: "1536x1024", quality: "medium", n: 1 })
    );
  });

  it("returns 500 when generateImg throws", async () => {
    mockGenerateImg.mockRejectedValue(new Error("API error"));
    const res = await POST(makeFormRequest({ prompt: "test", size: "1024x1024", quality: "low" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
