import { getStoredTheme, saveTheme, THEME_STORAGE_KEY } from "@/lib/theme";

describe("getStoredTheme", () => {
  beforeEach(() => localStorage.clear());

  it("returns 'dark' when nothing is stored", () => {
    expect(getStoredTheme()).toBe("dark");
  });

  it("returns 'light' when 'light' is stored", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    expect(getStoredTheme()).toBe("light");
  });

  it("returns 'dark' when 'dark' is stored", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(getStoredTheme()).toBe("dark");
  });

  it("returns 'dark' for an unrecognised stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "blue");
    expect(getStoredTheme()).toBe("dark");
  });
});

describe("saveTheme", () => {
  beforeEach(() => localStorage.clear());

  it("persists 'light' to localStorage", () => {
    saveTheme("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("persists 'dark' to localStorage", () => {
    saveTheme("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
