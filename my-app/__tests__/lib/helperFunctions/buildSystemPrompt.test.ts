import { buildSystemPrompt } from "@/lib/helperFunctions/buildSystemPrompt";

describe("buildSystemPrompt", () => {
  it("mentions FLUX for the flux-2-pro model", () => {
    expect(buildSystemPrompt("flux-2-pro")).toContain("FLUX");
  });

  it("does not mention FLUX for the gpt-image-1.5 model", () => {
    expect(buildSystemPrompt("gpt-image-1.5")).not.toContain("FLUX");
  });

  it("mentions GPT Image for the gpt-image-1.5 model", () => {
    expect(buildSystemPrompt("gpt-image-1.5")).toContain("GPT Image");
  });

  it("returns a non-empty string for each model", () => {
    expect(buildSystemPrompt("flux-2-pro").length).toBeGreaterThan(0);
    expect(buildSystemPrompt("gpt-image-1.5").length).toBeGreaterThan(0);
  });

  it("outputs differ between models", () => {
    expect(buildSystemPrompt("flux-2-pro")).not.toBe(buildSystemPrompt("gpt-image-1.5"));
  });
});
