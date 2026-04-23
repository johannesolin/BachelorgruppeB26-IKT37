/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/openAi/gpt54Client", () => ({
  gpt54PlacementSuggestionsRequest: jest.fn(),
}));
jest.mock("@/lib/helperFunctions/buildSystemPrompt", () => ({
  buildSystemPrompt: jest.fn().mockReturnValue("mocked system prompt"),
}));
jest.mock("@/lib/helperFunctions/buildUserPrompt", () => ({
  buildUserPrompt: jest.fn().mockReturnValue("mocked user prompt"),
}));

import { POST } from "@/app/api/openAi/placementSuggestion/route";
import { gpt54PlacementSuggestionsRequest } from "@/openAi/gpt54Client";
import { buildSystemPrompt } from "@/lib/helperFunctions/buildSystemPrompt";
import { buildUserPrompt } from "@/lib/helperFunctions/buildUserPrompt";

const mockRequest = gpt54PlacementSuggestionsRequest as jest.MockedFunction<typeof gpt54PlacementSuggestionsRequest>;
const mockBuildSystem = buildSystemPrompt as jest.MockedFunction<typeof buildSystemPrompt>;
const mockBuildUser = buildUserPrompt as jest.MockedFunction<typeof buildUserPrompt>;

function makeJsonRequest(body: object) {
  return new Request("http://localhost/", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/openAi/placementSuggestion", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns the placement suggestion text", async () => {
    mockRequest.mockResolvedValue("Place the mug near the coffee machine.");
    const res = await POST(makeJsonRequest({
      scenePrompt: "a modern kitchen",
      productSummary: "1 coffee mug",
    }));
    expect(res.status).toBe(200);
    expect(await res.json()).toBe("Place the mug near the coffee machine.");
  });

  it("forwards selectedModel to buildSystemPrompt", async () => {
    mockRequest.mockResolvedValue("text");
    await POST(makeJsonRequest({ selectedModel: "flux-2-pro", scenePrompt: "garden", productSummary: "trampoline" }));
    expect(mockBuildSystem).toHaveBeenCalledWith("flux-2-pro");
  });

  it("forwards scenePrompt and productSummary to buildUserPrompt", async () => {
    mockRequest.mockResolvedValue("text");
    await POST(makeJsonRequest({ selectedModel: "gpt-image-1.5", scenePrompt: "bathroom", productSummary: "soap dispenser" }));
    expect(mockBuildUser).toHaveBeenCalledWith("bathroom", "soap dispenser");
  });

  it("returns 500 when the AI request throws", async () => {
    mockRequest.mockRejectedValue(new Error("No return text from modell"));
    const res = await POST(makeJsonRequest({ scenePrompt: "x", productSummary: "y" }));
    expect(res.status).toBe(500);
  });
});
