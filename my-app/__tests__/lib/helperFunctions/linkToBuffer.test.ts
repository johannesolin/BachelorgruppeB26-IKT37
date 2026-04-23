import { linkToBuffer } from "@/lib/helperFunctions/linkToBuffer";

jest.mock("file-type", () => ({
  fileTypeFromBuffer: jest.fn().mockResolvedValue({ mime: "image/jpeg" }),
}));

describe("linkToBuffer", () => {
  const rawBytes = new Uint8Array([102, 97, 107, 101, 105, 109, 97, 103, 101, 100, 97, 116, 97]);

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(rawBytes.buffer),
    } as unknown as Response);
  });

  afterEach(() => jest.clearAllMocks());

  it("returns a Buffer from the fetched URL", async () => {
    const result = await linkToBuffer("https://example.com/image.jpg");
    expect(result.buffer).toBeInstanceOf(Buffer);
  });

  it("returns the detected MIME type", async () => {
    const result = await linkToBuffer("https://example.com/image.jpg");
    expect(result.fileType).toBe("image/jpeg");
  });

  it("calls fetch with the provided URL", async () => {
    await linkToBuffer("https://example.com/photo.png");
    expect(global.fetch).toHaveBeenCalledWith("https://example.com/photo.png");
  });
});
