import { toErrorMessage } from "@/lib/errors";

describe("toErrorMessage", () => {
  it("returns the message from an Error instance", () => {
    expect(toErrorMessage(new Error("something went wrong"))).toBe("something went wrong");
  });

  it("returns the string directly when given a string", () => {
    expect(toErrorMessage("plain string error")).toBe("plain string error");
  });

  it("JSON-stringifies plain objects", () => {
    expect(toErrorMessage({ code: 404 })).toBe('{"code":404}');
  });

  it("returns fallback for non-serializable values", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(toErrorMessage(circular)).toBe("Ukjent error");
  });

  it("returns fallback for null", () => {
    expect(toErrorMessage(null)).toBe("null");
  });
});
