import { linkToBase64 } from "@/lib/helperFunctions/linkToBase64";

describe("linkToBase64", () => {
  const rawBytes = new Uint8Array([102, 97, 107, 101, 105, 109, 97, 103, 101, 100, 97, 116, 97]);
  const expectedBase64 = Buffer.from(rawBytes).toString("base64");

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(rawBytes.buffer),
    } as unknown as Response);
  });

  afterEach(() => jest.clearAllMocks());

  it("returns a base64 encoded string", async () => {
    const result = await linkToBase64("https://example.com/image.jpg");
    expect(result).toBe(expectedBase64);
  });

  it("calls fetch with the provided URL", async () => {
    await linkToBase64("https://example.com/test.png");
    expect(global.fetch).toHaveBeenCalledWith("https://example.com/test.png");
  });

  it("returns a plain base64 string without data URL prefix", async () => {
    const result = await linkToBase64("https://example.com/image.jpg");
    expect(result).not.toContain("data:");
  });
});
