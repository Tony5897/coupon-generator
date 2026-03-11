import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  VALID_THEMES,
  isValidTheme,
  resolveTheme,
  getStoredTheme,
  setStoredTheme,
  applyThemeToDocument,
  getSystemPrefersDark,
} from "./theme";

// ─── isValidTheme ────────────────────────────────────────────────────────────

describe("isValidTheme", () => {
  it("accepts 'light'", () => expect(isValidTheme("light")).toBe(true));
  it("accepts 'dark'", () => expect(isValidTheme("dark")).toBe(true));
  it("accepts 'system'", () => expect(isValidTheme("system")).toBe(true));
  it("rejects empty string", () => expect(isValidTheme("")).toBe(false));
  it("rejects arbitrary string", () => expect(isValidTheme("auto")).toBe(false));
  it("rejects null", () => expect(isValidTheme(null)).toBe(false));
  it("rejects undefined", () => expect(isValidTheme(undefined)).toBe(false));
  it("rejects a number", () => expect(isValidTheme(1)).toBe(false));
  it("rejects an object", () => expect(isValidTheme({})).toBe(false));
  it("VALID_THEMES contains exactly 3 entries", () =>
    expect(VALID_THEMES).toHaveLength(3));
  it("VALID_THEMES contains light, dark, and system", () => {
    expect(VALID_THEMES).toContain("light");
    expect(VALID_THEMES).toContain("dark");
    expect(VALID_THEMES).toContain("system");
  });
});

// ─── resolveTheme ────────────────────────────────────────────────────────────

describe("resolveTheme", () => {
  it("returns 'light' when theme is 'light' and prefersDark is false", () => {
    expect(resolveTheme("light", false)).toBe("light");
  });
  it("returns 'light' when theme is 'light' and prefersDark is true (explicit wins)", () => {
    expect(resolveTheme("light", true)).toBe("light");
  });
  it("returns 'dark' when theme is 'dark' and prefersDark is false (explicit wins)", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
  });
  it("returns 'dark' when theme is 'dark' and prefersDark is true", () => {
    expect(resolveTheme("dark", true)).toBe("dark");
  });
  it("returns 'light' when theme is 'system' and prefersDark is false", () => {
    expect(resolveTheme("system", false)).toBe("light");
  });
  it("returns 'dark' when theme is 'system' and prefersDark is true", () => {
    expect(resolveTheme("system", true)).toBe("dark");
  });
  it("only ever returns 'light' or 'dark'", () => {
    const results = [
      resolveTheme("light", false),
      resolveTheme("light", true),
      resolveTheme("dark", false),
      resolveTheme("dark", true),
      resolveTheme("system", false),
      resolveTheme("system", true),
    ];
    results.forEach((r) => expect(["light", "dark"]).toContain(r));
  });
});

// ─── getStoredTheme / setStoredTheme ─────────────────────────────────────────

describe("getStoredTheme / setStoredTheme", () => {
  beforeEach(() => localStorage.clear());

  it("returns 'system' (default fallback) when nothing is stored", () => {
    expect(getStoredTheme()).toBe("system");
  });

  it("returns the specified fallback when nothing is stored", () => {
    expect(getStoredTheme("dark")).toBe("dark");
    expect(getStoredTheme("light")).toBe("light");
  });

  it("returns the stored theme after setStoredTheme('light')", () => {
    setStoredTheme("light");
    expect(getStoredTheme()).toBe("light");
  });

  it("returns the stored theme after setStoredTheme('dark')", () => {
    setStoredTheme("dark");
    expect(getStoredTheme()).toBe("dark");
  });

  it("returns the stored theme after setStoredTheme('system')", () => {
    setStoredTheme("system");
    expect(getStoredTheme()).toBe("system");
  });

  it("falls back to 'system' for an invalid stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "invalid");
    expect(getStoredTheme()).toBe("system");
  });

  it("falls back to the custom fallback for an invalid stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "invalid");
    expect(getStoredTheme("light")).toBe("light");
  });

  it("persists with the correct localStorage key", () => {
    setStoredTheme("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("overwrites a previously stored value", () => {
    setStoredTheme("light");
    setStoredTheme("dark");
    expect(getStoredTheme()).toBe("dark");
  });

  it("THEME_STORAGE_KEY is a non-empty string", () => {
    expect(typeof THEME_STORAGE_KEY).toBe("string");
    expect(THEME_STORAGE_KEY.length).toBeGreaterThan(0);
  });
});

// ─── applyThemeToDocument ────────────────────────────────────────────────────

describe("applyThemeToDocument", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
  });

  it("adds 'dark' class to <html> for dark theme", () => {
    applyThemeToDocument("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("sets data-theme='dark' for dark theme", () => {
    applyThemeToDocument("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("removes 'dark' class from <html> for light theme", () => {
    document.documentElement.classList.add("dark");
    applyThemeToDocument("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("sets data-theme='light' for light theme", () => {
    applyThemeToDocument("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("is idempotent when called twice with 'dark'", () => {
    applyThemeToDocument("dark");
    applyThemeToDocument("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("is idempotent when called twice with 'light'", () => {
    applyThemeToDocument("light");
    applyThemeToDocument("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("correctly toggles from dark to light", () => {
    applyThemeToDocument("dark");
    applyThemeToDocument("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("correctly toggles from light to dark", () => {
    applyThemeToDocument("light");
    applyThemeToDocument("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});

// ─── getSystemPrefersDark ────────────────────────────────────────────────────

describe("getSystemPrefersDark", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it("returns true when OS prefers dark", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    expect(getSystemPrefersDark()).toBe(true);
  });

  it("returns false when OS does not prefer dark", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    expect(getSystemPrefersDark()).toBe(false);
  });

  it("queries the correct media feature", () => {
    const mockMatchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });
    getSystemPrefersDark();
    expect(mockMatchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
  });
});
