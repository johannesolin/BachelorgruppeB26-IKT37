import { base64LinkToBase64 } from "@/lib/helperFunctions/base64LinkToBase64";

describe("base64LinkToBase64", () => {
  it("strips the data URL prefix and returns raw base64", () => {
    expect(base64LinkToBase64("data:image/jpeg;base64,/9j/abc123")).toBe("/9j/abc123");
  });

  it("works with png data URLs", () => {
    expect(base64LinkToBase64("data:image/png;base64,iVBORw0KGgo=")).toBe("iVBORw0KGgo=");
  });

  it("returns only the base64 payload without the header", () => {
    const result = base64LinkToBase64("data:image/webp;base64,UklGRg==");
    expect(result).not.toContain("data:");
    expect(result).not.toContain("base64,");
    expect(result).toBe("UklGRg==");
  });
});
