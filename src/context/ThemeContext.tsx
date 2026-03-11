"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type Theme,
  applyThemeToDocument,
  getStoredTheme,
  getSystemPrefersDark,
  resolveTheme,
  setStoredTheme,
} from "@/lib/theme";

interface ThemeContextValue {
  /** The user's explicit preference: 'light', 'dark', or 'system'. */
  theme: Theme;
  /** The effective theme after resolving 'system' against OS preference. */
  resolvedTheme: "light" | "dark";
  /** Update the theme preference (persisted to localStorage). */
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  /**
   * The initial theme before localStorage is read on mount.
   * Also used as the fallback when localStorage has no stored value.
   * Defaults to 'system'.
   */
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemDark, setSystemDark] = useState(false);

  // Hydrate from localStorage on mount; fall back to defaultTheme when nothing stored.
  useEffect(() => {
    setThemeState(getStoredTheme(defaultTheme));
    setSystemDark(getSystemPrefersDark());
  }, [defaultTheme]);

  // Mirror real-time OS preference changes so the resolved theme stays current.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const resolvedTheme = useMemo(
    () => resolveTheme(theme, systemDark),
    [theme, systemDark]
  );

  // Apply dark/light class to <html> whenever the resolved theme changes.
  useEffect(() => {
    applyThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
