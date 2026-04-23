/** @jest-environment node */
jest.mock("server-only", () => ({}));

const mockGenerate = jest.fn();
const mockEdit = jest.fn();

jest.mock("openai", () => ({
  AzureOpenAI: jest.fn().mockImplementation(() => ({
    images: { generate: mockGenerate, edit: mockEdit },
  })),
  toFile: jest.fn().mockImplementation(async (buf: Buffer) => buf),
}));

process.env.AZURE_OPENAI_ENDPOINT = "https://test.openai.azure.com";
process.env.AZURE_OPENAI_API_KEY = "test-key";
process.env.AZURE_OPENAI_API_VERSION = "2024-01-01";
process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT = "test-deployment";

import { generateImg, editImg, addProductsToScene } from "@/openAi/client";

const sceneBuffer = { buffer: Buffer.from("scene"), fileType: "image/jpeg" };
const productBuffer = { buffer: Buffer.from("product"), fileType: "image/png" };

describe("generateImg", () => {
  afterEach(() => {
    mockGenerate.mockReset();
    mockEdit.mockReset();
  });

  it("returns a data URL prefixed base64 string", async () => {
    mockGenerate.mockResolvedValue({ data: [{ b64_json: "abc123" }] });
    const result = await generateImg({ prompt: "kitchen", n: 1, size: "1024x1024", quality: "high" });
    expect(result).toBe("data:image/jpeg;base64,abc123");
  });

  it("throws when data[0].b64_json is missing", async () => {
    mockGenerate.mockResolvedValue({ data: [{}] });
    await expect(generateImg({ prompt: "test", n: 1 })).rejects.toThrow("No image returned");
  });

  it("calls images.generate with the correct output_format", async () => {
    mockGenerate.mockResolvedValue({ data: [{ b64_json: "x" }] });
    await generateImg({ prompt: "test", n: 1, size: "1536x1024", quality: "low" });
    expect(mockGenerate).toHaveBeenCalledWith(expect.objectContaining({ output_format: "jpeg" }));
  });
});

describe("editImg", () => {
  afterEach(() => {
    mockGenerate.mockReset();
    mockEdit.mockReset();
  });

  it("returns a data URL prefixed base64 string", async () => {
    mockEdit.mockResolvedValue({ data: [{ b64_json: "edited" }] });
    const result = await editImg({ prompt: "edit scene", n: 1, scene: sceneBuffer });
    expect(result).toBe("data:image/jpeg;base64,edited");
  });

  it("throws when b64_json is missing", async () => {
    mockEdit.mockResolvedValue({ data: [{}] });
    await expect(editImg({ prompt: "x", n: 1, scene: sceneBuffer })).rejects.toThrow("No image returned");
  });

  it("calls images.edit with input_fidelity high", async () => {
    mockEdit.mockResolvedValue({ data: [{ b64_json: "x" }] });
    await editImg({ prompt: "test", n: 1, scene: sceneBuffer });
    expect(mockEdit).toHaveBeenCalledWith(expect.objectContaining({ input_fidelity: "high" }));
  });
});

describe("addProductsToScene", () => {
  afterEach(() => {
    mockGenerate.mockReset();
    mockEdit.mockReset();
  });

  it("returns an array of data URL prefixed strings", async () => {
    mockEdit.mockResolvedValue({ data: [{ b64_json: "img1" }, { b64_json: "img2" }] });
    const result = await addProductsToScene({
      prompt: "place product",
      n: 2,
      scene: sceneBuffer,
      products: [productBuffer],
    });
    expect(result).toEqual(["data:image/jpeg;base64,img1", "data:image/jpeg;base64,img2"]);
  });

  it("throws when data is missing", async () => {
    mockEdit.mockResolvedValue({});
    await expect(
      addProductsToScene({ prompt: "x", n: 1, scene: sceneBuffer, products: [productBuffer] })
    ).rejects.toThrow("No image returned");
  });
});
