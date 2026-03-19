export const THEME_STORAGE_KEY = "app-theme-mode";

export type ThemeMode = "light" | "dark";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch (e) {
    console.error("Failed to read theme from localStorage:", e);
  }

  return "dark";
}

export function saveTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error("Failed to save theme to localStorage:", e);
  }
}
