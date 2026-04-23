import { buildUserPrompt } from "@/lib/helperFunctions/buildUserPrompt";

describe("buildUserPrompt", () => {
  it("includes the scenePrompt in the output", () => {
    const result = buildUserPrompt("a sunny kitchen", "one coffee mug");
    expect(result).toContain("a sunny kitchen");
  });

  it("includes the productSummary in the output", () => {
    const result = buildUserPrompt("a sunny kitchen", "one coffee mug");
    expect(result).toContain("one coffee mug");
  });

  it("returns a string", () => {
    expect(typeof buildUserPrompt("scene", "product")).toBe("string");
  });

  it("result changes when inputs change", () => {
    const a = buildUserPrompt("kitchen", "mug");
    const b = buildUserPrompt("garden", "trampoline");
    expect(a).not.toBe(b);
  });
});
