/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/openAi/client", () => ({
  editImg: jest.fn(),
}));
jest.mock("@/lib/helperFunctions/base64ToBuffer", () => ({
  base64ToBuffer: jest.fn().mockReturnValue({ buffer: Buffer.from("scene"), fileType: "image/jpeg" }),
}));

import { POST } from "@/app/api/openAi/editFinalImage/route";
import { editImg } from "@/openAi/client";

const mockEditImg = editImg as jest.MockedFunction<typeof editImg>;

function makeJsonRequest(body: object) {
  return new Request("http://localhost/", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/openAi/editFinalImage", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns the edited final image on success", async () => {
    mockEditImg.mockResolvedValue("data:image/jpeg;base64,final");
    const res = await POST(makeJsonRequest({
      editResultPrompt: "make it brighter",
      scene: "data:image/jpeg;base64,scene",
    }));
    expect(res.status).toBe(200);
    expect(await res.json()).toBe("data:image/jpeg;base64,final");
  });

  it("uses fixed size 1536x1024 and quality high", async () => {
    mockEditImg.mockResolvedValue("data:image/jpeg;base64,x");
    await POST(makeJsonRequest({ editResultPrompt: "edit", scene: "data:image/jpeg;base64,s" }));
    expect(mockEditImg).toHaveBeenCalledWith(
      expect.objectContaining({ size: "1536x1024", quality: "high" })
    );
  });

  it("returns 500 when editImg throws", async () => {
    mockEditImg.mockRejectedValue(new Error("fail"));
    const res = await POST(makeJsonRequest({ editResultPrompt: "x", scene: "data:image/jpeg;base64,x" }));
    expect(res.status).toBe(500);
  });
});
