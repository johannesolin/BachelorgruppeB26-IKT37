/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/db/actions", () => ({
  getProductById: jest.fn(),
}));

import { GET } from "@/app/api/products/by-id/route";
import { getProductById } from "@/db/actions";

const mockGetProductById = getProductById as jest.MockedFunction<typeof getProductById>;

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/products/by-id");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

describe("GET /api/products/by-id", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns 400 when productId is missing", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing productId" });
  });

  it("returns 400 when productId is whitespace only", async () => {
    const res = await GET(makeRequest({ productId: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when no product is found", async () => {
    mockGetProductById.mockResolvedValue([]);
    const res = await GET(makeRequest({ productId: "999" }));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Product not found" });
  });

  it("returns the product with selectedImage set to 0", async () => {
    const product = {
      productId: 1,
      name: "Test Product",
      categoryName: "Cat",
      images: [],
      selectedImage: 5,
    };
    mockGetProductById.mockResolvedValue([product]);
    const res = await GET(makeRequest({ productId: "1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.selectedImage).toBe(0);
    expect(body.name).toBe("Test Product");
  });

  it("returns 500 when getProductById throws", async () => {
    mockGetProductById.mockRejectedValue(new Error("DB failure"));
    const res = await GET(makeRequest({ productId: "1" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
