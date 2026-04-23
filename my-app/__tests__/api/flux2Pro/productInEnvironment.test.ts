/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/flux2Pro/client", () => ({
  createImgFlux: jest.fn(),
}));
jest.mock("@/lib/helperFunctions/base64LinkToBase64", () => ({
  base64LinkToBase64: jest.fn().mockReturnValue("rawscenebase64"),
}));
jest.mock("@/lib/helperFunctions/linkToBase64", () => ({
  linkToBase64: jest.fn().mockResolvedValue("rawproductbase64"),
}));

import { POST } from "@/app/api/flux2Pro/productInEnvironment/route";
import { createImgFlux } from "@/flux2Pro/client";

const mockCreateImgFlux = createImgFlux as jest.MockedFunction<typeof createImgFlux>;

function makeFormRequest(fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  return new Request("http://localhost/", { method: "POST", body: form });
}

describe("POST /api/flux2Pro/productInEnvironment", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns an array of result images on success", async () => {
    mockCreateImgFlux.mockResolvedValue("data:image/jpeg;base64,result");
    const res = await POST(makeFormRequest({
      prompt: "place product",
      productCount: "1",
      scene: "data:image/jpeg;base64,scene",
      variants: "2",
      product0: "https://example.com/product.jpg",
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
  });

  it("calls createImgFlux once per variant", async () => {
    mockCreateImgFlux.mockResolvedValue("data:image/jpeg;base64,x");
    await POST(makeFormRequest({
      prompt: "test",
      productCount: "1",
      scene: "data:image/jpeg;base64,s",
      variants: "3",
      product0: "https://example.com/p.jpg",
    }));
    expect(mockCreateImgFlux).toHaveBeenCalledTimes(3);
  });

  it("returns 500 when createImgFlux throws", async () => {
    mockCreateImgFlux.mockRejectedValue(new Error("fail"));
    const res = await POST(makeFormRequest({
      prompt: "x",
      productCount: "0",
      scene: "data:image/jpeg;base64,s",
      variants: "1",
    }));
    expect(res.status).toBe(500);
  });
});
