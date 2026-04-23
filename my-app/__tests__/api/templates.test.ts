/** @jest-environment node */
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
}));

import { GET } from "@/app/api/templates/route";
import fs from "fs";

const mockExistsSync = fs.existsSync as jest.Mock;
const mockReaddirSync = fs.readdirSync as jest.Mock;
const mockReadFileSync = fs.readFileSync as jest.Mock;

describe("GET /api/templates", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns 404 when the templates folder does not exist", async () => {
    mockExistsSync.mockReturnValue(false);
    const res = await GET();
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Mappe mangler" });
  });

  it("returns an array of templates from JSON files", async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["kitchen.json", "bathroom.json"]);
    mockReadFileSync
      .mockReturnValueOnce(JSON.stringify({ id: "kitchen", name: "Kitchen", type: "soft" }))
      .mockReturnValueOnce(JSON.stringify({ id: "bathroom", name: "Bathroom", type: "hard" }));

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0].id).toBe("kitchen");
    expect(body[1].id).toBe("bathroom");
  });

  it("ignores non-JSON files in the folder", async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["template.json", "readme.txt", ".DS_Store"]);
    mockReadFileSync.mockReturnValue(JSON.stringify({ id: "t", name: "T", type: "soft" }));

    const body = await (await GET()).json();
    expect(body).toHaveLength(1);
  });

  it("falls back to filename as id when id is absent in JSON", async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["mytemplate.json"]);
    mockReadFileSync.mockReturnValue(JSON.stringify({ name: "My Template", type: "soft" }));

    const body = await (await GET()).json();
    expect(body[0].id).toBe("mytemplate");
  });

  it("defaults type to 'hard' when type is absent in JSON", async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["t.json"]);
    mockReadFileSync.mockReturnValue(JSON.stringify({ id: "t", name: "T" }));

    const body = await (await GET()).json();
    expect(body[0].type).toBe("hard");
  });

  it("returns a fallback error entry when reading files throws", async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockImplementation(() => {
      throw new Error("fs error");
    });

    const body = await (await GET()).json();
    expect(body[0].name).toBe("Feil ved lesing");
  });
});
