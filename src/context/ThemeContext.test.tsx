import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { THEME_STORAGE_KEY } from "@/lib/theme";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Minimal component that exposes the context value via the DOM. */
function ThemeConsumer() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("system")}>Set System</button>
    </div>
  );
}

function mockMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersDark && query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function renderWithProvider(prefersDark = false, defaultTheme?: "light" | "dark" | "system") {
  mockMatchMedia(prefersDark);
  return render(
    <ThemeProvider {...(defaultTheme ? { defaultTheme } : {})}>
      <ThemeConsumer />
    </ThemeProvider>
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useTheme — outside provider", () => {
  it("throws when used outside ThemeProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow(
      "useTheme must be used within a ThemeProvider"
    );
    consoleSpy.mockRestore();
  });
});

describe("ThemeProvider — initial state", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to 'system' theme when localStorage is empty", async () => {
    await act(async () => renderWithProvider());
    expect(screen.getByTestId("theme").textContent).toBe("system");
  });

  it("resolves 'system' to 'light' when OS is in light mode", async () => {
    await act(async () => renderWithProvider(false));
    expect(screen.getByTestId("resolved").textContent).toBe("light");
  });

  it("resolves 'system' to 'dark' when OS is in dark mode", async () => {
    await act(async () => renderWithProvider(true));
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  it("uses defaultTheme when localStorage is empty", async () => {
    await act(async () => renderWithProvider(false, "dark"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("uses localStorage value over defaultTheme when a stored value exists", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    await act(async () => renderWithProvider(false, "dark"));
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  it("hydrates stored 'dark' theme from localStorage", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    await act(async () => renderWithProvider(false));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  it("hydrates stored 'light' theme from localStorage", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    await act(async () => renderWithProvider(true)); // OS dark, but stored is light
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(screen.getByTestId("resolved").textContent).toBe("light");
  });
});

describe("ThemeProvider — document class management", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
  });

  it("applies 'dark' class to <html> when resolved theme is dark", async () => {
    await act(async () => renderWithProvider(true));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes 'dark' class from <html> when resolved theme is light", async () => {
    document.documentElement.classList.add("dark");
    await act(async () => renderWithProvider(false));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("sets data-theme='dark' on <html> when resolved is dark", async () => {
    await act(async () => renderWithProvider(true));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("sets data-theme='light' on <html> when resolved is light", async () => {
    await act(async () => renderWithProvider(false));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});

describe("ThemeProvider — setTheme interactions", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
    mockMatchMedia(false);
  });

  it("updates theme state when setTheme('dark') is called", async () => {
    await act(async () => renderWithProvider());
    await act(async () => screen.getByText("Set Dark").click());
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  it("updates theme state when setTheme('light') is called", async () => {
    await act(async () => renderWithProvider());
    await act(async () => screen.getByText("Set Light").click());
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(screen.getByTestId("resolved").textContent).toBe("light");
  });

  it("updates theme state when setTheme('system') is called", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    await act(async () => renderWithProvider(false));
    await act(async () => screen.getByText("Set System").click());
    expect(screen.getByTestId("theme").textContent).toBe("system");
    expect(screen.getByTestId("resolved").textContent).toBe("light"); // OS is light
  });

  it("persists theme to localStorage when setTheme is called", async () => {
    await act(async () => renderWithProvider());
    await act(async () => screen.getByText("Set Dark").click());
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("persists 'light' to localStorage", async () => {
    await act(async () => renderWithProvider());
    await act(async () => screen.getByText("Set Light").click());
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("applies 'dark' class to <html> after setTheme('dark')", async () => {
    await act(async () => renderWithProvider());
    await act(async () => screen.getByText("Set Dark").click());
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes 'dark' class from <html> after setTheme('light')", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    await act(async () => renderWithProvider());
    await act(async () => screen.getByText("Set Light").click());
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("cycles through all three themes correctly", async () => {
    await act(async () => renderWithProvider());

    await act(async () => screen.getByText("Set Light").click());
    expect(screen.getByTestId("theme").textContent).toBe("light");

    await act(async () => screen.getByText("Set Dark").click());
    expect(screen.getByTestId("theme").textContent).toBe("dark");

    await act(async () => screen.getByText("Set System").click());
    expect(screen.getByTestId("theme").textContent).toBe("system");
  });
});
