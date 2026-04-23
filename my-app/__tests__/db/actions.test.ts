/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/db/db", () => ({
  executeQuery: jest.fn(),
}));

import { getProductById } from "@/db/actions";
import { executeQuery } from "@/db/db";

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>;

describe("getProductById", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns a products array on success", async () => {
    const product = [
      { productId: 1, name: "Mug", categoryName: "Kitchenware", images: [], selectedImage: 0 },
    ];
    mockExecuteQuery.mockResolvedValue(product);
    const result = await getProductById("1");
    expect(result).toEqual(product);
  });

  it("throws when executeQuery returns undefined", async () => {
    mockExecuteQuery.mockResolvedValue(undefined);
    await expect(getProductById("1")).rejects.toThrow("Error getting product");
  });

  it("throws when executeQuery rejects", async () => {
    mockExecuteQuery.mockRejectedValue(new Error("DB down"));
    await expect(getProductById("1")).rejects.toThrow("Error getting product");
  });

  it("calls executeQuery with the correct productId", async () => {
    mockExecuteQuery.mockResolvedValue([]);
    await getProductById("42").catch(() => {});
    expect(mockExecuteQuery).toHaveBeenCalledWith(expect.any(String), "42");
  });

  it("passes a query that targets the products table", async () => {
    mockExecuteQuery.mockResolvedValue([]);
    await getProductById("1").catch(() => {});
    expect(mockExecuteQuery).toHaveBeenCalledWith(
      expect.stringContaining("products"),
      expect.any(String)
    );
  });
});
