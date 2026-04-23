/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/openAi/client", () => ({
  addProductsToScene: jest.fn(),
}));
jest.mock("@/lib/helperFunctions/base64ToBuffer", () => ({
  base64ToBuffer: jest.fn().mockReturnValue({ buffer: Buffer.from("scene"), fileType: "image/jpeg" }),
}));
jest.mock("@/lib/helperFunctions/linkToBuffer", () => ({
  linkToBuffer: jest.fn().mockResolvedValue({ buffer: Buffer.from("product"), fileType: "image/jpeg" }),
}));

import { POST } from "@/app/api/openAi/productInEnvironment/route";
import { addProductsToScene } from "@/openAi/client";

const mockAddProducts = addProductsToScene as jest.MockedFunction<typeof addProductsToScene>;

function makeFormRequest(fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  return new Request("http://localhost/", { method: "POST", body: form });
}

describe("POST /api/openAi/productInEnvironment", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns the result images on success", async () => {
    mockAddProducts.mockResolvedValue(["data:image/jpeg;base64,img1", "data:image/jpeg;base64,img2"]);
    const res = await POST(makeFormRequest({
      prompt: "place product in scene",
      variants: "2",
      productCount: "1",
      scene: "data:image/jpeg;base64,scene",
      product0: "https://example.com/product.jpg",
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(["data:image/jpeg;base64,img1", "data:image/jpeg;base64,img2"]);
  });

  it("uses fixed size 1536x1024 and quality high", async () => {
    mockAddProducts.mockResolvedValue(["data:image/jpeg;base64,x"]);
    await POST(makeFormRequest({
      prompt: "test",
      variants: "1",
      productCount: "1",
      scene: "data:image/jpeg;base64,s",
      product0: "https://example.com/p.jpg",
    }));
    expect(mockAddProducts).toHaveBeenCalledWith(
      expect.objectContaining({ size: "1536x1024", quality: "high" })
    );
  });

  it("returns 500 when addProductsToScene throws", async () => {
    mockAddProducts.mockRejectedValue(new Error("fail"));
    const res = await POST(makeFormRequest({
      prompt: "x",
      variants: "1",
      productCount: "0",
      scene: "data:image/jpeg;base64,s",
    }));
    expect(res.status).toBe(500);
  });
});
