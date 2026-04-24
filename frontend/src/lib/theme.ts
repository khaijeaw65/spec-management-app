/** localStorage key — keep in sync with theme bootstrap script in root layout */
export const THEME_STORAGE_KEY = "theme";

export type ThemePreference = "light" | "dark";

export function applyThemeClass(theme: ThemePreference) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
