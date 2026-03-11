export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "coupon-generator-theme";

export const VALID_THEMES: readonly Theme[] = [
  "light",
  "dark",
  "system",
] as const;

export function isValidTheme(value: unknown): value is Theme {
  return VALID_THEMES.includes(value as Theme);
}

/**
 * Resolves the effective display theme ('light' | 'dark') given the user's
 * explicit preference and the current OS dark-mode setting.
 */
export function resolveTheme(
  theme: Theme,
  prefersDark: boolean
): "light" | "dark" {
  if (theme === "system") return prefersDark ? "dark" : "light";
  return theme;
}

/**
 * Reads the persisted theme from localStorage.
 * Returns `fallback` (default: "system") when nothing is stored or the
 * stored value is not a recognised Theme.
 */
export function getStoredTheme(fallback: Theme = "system"): Theme {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (isValidTheme(stored)) return stored;
  return fallback;
}

/**
 * Persists the chosen theme to localStorage.
 */
export function setStoredTheme(theme: Theme): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

/**
 * Applies the resolved theme to <html> by toggling the 'dark' CSS class
 * and setting the data-theme attribute for any CSS-variable overrides.
 */
export function applyThemeToDocument(resolved: "light" | "dark"): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.setAttribute("data-theme", resolved);
}

/**
 * Returns whether the OS is currently set to dark mode.
 */
export function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
