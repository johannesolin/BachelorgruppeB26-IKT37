/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/flux2Pro/client", () => ({
  createImgFlux: jest.fn(),
}));
jest.mock("@/lib/helperFunctions/base64LinkToBase64", () => ({
  base64LinkToBase64: jest.fn().mockReturnValue("rawbase64data"),
}));

import { POST } from "@/app/api/flux2Pro/editFinalImage/route";
import { createImgFlux } from "@/flux2Pro/client";

const mockCreateImgFlux = createImgFlux as jest.MockedFunction<typeof createImgFlux>;

function makeJsonRequest(body: object) {
  return new Request("http://localhost/", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/flux2Pro/editFinalImage", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns the edited final image on success", async () => {
    mockCreateImgFlux.mockResolvedValue("data:image/jpeg;base64,final");
    const res = await POST(makeJsonRequest({
      editResultPrompt: "make it darker",
      scene: "data:image/jpeg;base64,scene",
    }));
    expect(res.status).toBe(200);
    expect(await res.json()).toBe("data:image/jpeg;base64,final");
  });

  it("uses fixed size 1536x1024", async () => {
    mockCreateImgFlux.mockResolvedValue("data:image/jpeg;base64,x");
    await POST(makeJsonRequest({ editResultPrompt: "edit", scene: "data:image/jpeg;base64,s" }));
    expect(mockCreateImgFlux).toHaveBeenCalledWith(
      expect.objectContaining({ width: "1536", height: "1024" })
    );
  });

  it("returns 500 when createImgFlux throws", async () => {
    mockCreateImgFlux.mockRejectedValue(new Error("fail"));
    const res = await POST(makeJsonRequest({ editResultPrompt: "x", scene: "data:image/jpeg;base64,x" }));
    expect(res.status).toBe(500);
  });
});
