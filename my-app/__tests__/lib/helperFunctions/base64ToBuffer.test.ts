import { base64ToBuffer } from "@/lib/helperFunctions/base64ToBuffer";

describe("base64ToBuffer", () => {
  it("extracts the MIME type from the data URL", () => {
    const input = "data:image/jpeg;base64,/9j/abc123";
    expect(base64ToBuffer(input).fileType).toBe("image/jpeg");
  });

  it("extracts png MIME type", () => {
    const input = "data:image/png;base64,iVBORw0KGgo=";
    expect(base64ToBuffer(input).fileType).toBe("image/png");
  });

  it("decodes the base64 data into a Buffer", () => {
    const raw = Buffer.from("hello world").toString("base64");
    const input = `data:image/jpeg;base64,${raw}`;
    const { buffer } = base64ToBuffer(input);
    expect(buffer.toString()).toBe("hello world");
  });

  it("returns an object with buffer and fileType properties", () => {
    const result = base64ToBuffer("data:image/png;base64,dGVzdA==");
    expect(result).toHaveProperty("buffer");
    expect(result).toHaveProperty("fileType");
    expect(result.buffer).toBeInstanceOf(Buffer);
  });
});
