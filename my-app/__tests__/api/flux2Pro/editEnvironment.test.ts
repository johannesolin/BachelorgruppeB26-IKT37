/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/flux2Pro/client", () => ({
  createImgFlux: jest.fn(),
}));
jest.mock("@/lib/helperFunctions/base64LinkToBase64", () => ({
  base64LinkToBase64: jest.fn().mockReturnValue("rawbase64data"),
}));

import { POST } from "@/app/api/flux2Pro/editEnvironment/route";
import { createImgFlux } from "@/flux2Pro/client";

const mockCreateImgFlux = createImgFlux as jest.MockedFunction<typeof createImgFlux>;

function makeFormRequest(fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  return new Request("http://localhost/", { method: "POST", body: form });
}

describe("POST /api/flux2Pro/editEnvironment", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns the edited image on success", async () => {
    mockCreateImgFlux.mockResolvedValue("data:image/jpeg;base64,edited");
    const res = await POST(makeFormRequest({
      prompt: "warmer tones",
      size: "1536x1024",
      scene: "data:image/jpeg;base64,original",
    }));
    expect(res.status).toBe(200);
    expect(await res.json()).toBe("data:image/jpeg;base64,edited");
  });

  it("includes the scene as input_image in the flux body", async () => {
    mockCreateImgFlux.mockResolvedValue("data:image/jpeg;base64,x");
    await POST(makeFormRequest({ prompt: "test", size: "1024x1024", scene: "data:image/jpeg;base64,s" }));
    expect(mockCreateImgFlux).toHaveBeenCalledWith(
      expect.objectContaining({ input_image: "rawbase64data" })
    );
  });

  it("returns 500 when createImgFlux throws", async () => {
    mockCreateImgFlux.mockRejectedValue(new Error("fail"));
    const res = await POST(makeFormRequest({ prompt: "x", size: "1024x1024", scene: "data:image/jpeg;base64,x" }));
    expect(res.status).toBe(500);
  });
});
