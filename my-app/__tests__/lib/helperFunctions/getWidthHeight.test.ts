import { getWidthHeight } from "@/lib/helperFunctions/getWidthHeight";

describe("getWidthHeight", () => {
  it("parses '1024x1024' into equal width and height", () => {
    expect(getWidthHeight("1024x1024")).toEqual({ width: "1024", height: "1024" });
  });

  it("parses '1536x1024' (landscape)", () => {
    expect(getWidthHeight("1536x1024")).toEqual({ width: "1536", height: "1024" });
  });

  it("parses '1024x1536' (portrait)", () => {
    expect(getWidthHeight("1024x1536")).toEqual({ width: "1024", height: "1536" });
  });

  it("returns string values, not numbers", () => {
    const { width, height } = getWidthHeight("800x600");
    expect(typeof width).toBe("string");
    expect(typeof height).toBe("string");
  });
});
