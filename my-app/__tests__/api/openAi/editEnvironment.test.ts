/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/openAi/client", () => ({
  editImg: jest.fn(),
}));
jest.mock("@/lib/helperFunctions/base64ToBuffer", () => ({
  base64ToBuffer: jest.fn().mockReturnValue({ buffer: Buffer.from("scene"), fileType: "image/jpeg" }),
}));

import { POST } from "@/app/api/openAi/editEnvironment/route";
import { editImg } from "@/openAi/client";

const mockEditImg = editImg as jest.MockedFunction<typeof editImg>;

function makeFormRequest(fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  return new Request("http://localhost/", { method: "POST", body: form });
}

describe("POST /api/openAi/editEnvironment", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns the edited image on success", async () => {
    mockEditImg.mockResolvedValue("data:image/jpeg;base64,edited");
    const res = await POST(makeFormRequest({
      prompt: "make it warmer",
      size: "1024x1024",
      quality: "medium",
      scene: "data:image/jpeg;base64,original",
    }));
    expect(res.status).toBe(200);
    expect(await res.json()).toBe("data:image/jpeg;base64,edited");
  });

  it("passes correct props to editImg", async () => {
    mockEditImg.mockResolvedValue("data:image/jpeg;base64,x");
    await POST(makeFormRequest({ prompt: "edit", size: "1536x1024", quality: "high", scene: "data:image/jpeg;base64,s" }));
    expect(mockEditImg).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: "edit", n: 1, size: "1536x1024", quality: "high" })
    );
  });

  it("returns 500 when editImg throws", async () => {
    mockEditImg.mockRejectedValue(new Error("fail"));
    const res = await POST(makeFormRequest({ prompt: "x", size: "1024x1024", quality: "low", scene: "data:image/jpeg;base64,x" }));
    expect(res.status).toBe(500);
  });
});
