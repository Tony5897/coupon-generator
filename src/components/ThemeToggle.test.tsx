import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act, screen } from "@testing-library/react";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";
import { THEME_STORAGE_KEY } from "@/lib/theme";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockMatchMedia(prefersDark = false) {
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

async function renderToggle(prefersDark = false) {
  mockMatchMedia(prefersDark);
  await act(async () =>
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ThemeToggle — rendering", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders a group element with accessible label", async () => {
    await renderToggle();
    expect(screen.getByRole("group", { name: /theme selector/i })).toBeDefined();
  });

  it("renders the Light mode button", async () => {
    await renderToggle();
    expect(screen.getByRole("button", { name: /switch to light mode/i })).toBeDefined();
  });

  it("renders the Dark mode button", async () => {
    await renderToggle();
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeDefined();
  });

  it("renders the System theme button", async () => {
    await renderToggle();
    expect(screen.getByRole("button", { name: /use system theme preference/i })).toBeDefined();
  });

  it("renders exactly 3 buttons", async () => {
    await renderToggle();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("all buttons have type='button' to prevent accidental form submission", async () => {
    await renderToggle();
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn.getAttribute("type")).toBe("button");
    });
  });

  it("all buttons have a title attribute", async () => {
    await renderToggle();
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn.getAttribute("title")).toBeTruthy();
    });
  });
});

describe("ThemeToggle — aria-pressed state", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
  });

  it("marks 'System' button as pressed by default", async () => {
    await renderToggle();
    const systemBtn = screen.getByRole("button", { name: /use system theme preference/i });
    expect(systemBtn.getAttribute("aria-pressed")).toBe("true");
  });

  it("marks 'Light' and 'Dark' buttons as not pressed by default", async () => {
    await renderToggle();
    expect(
      screen.getByRole("button", { name: /switch to light mode/i }).getAttribute("aria-pressed")
    ).toBe("false");
    expect(
      screen.getByRole("button", { name: /switch to dark mode/i }).getAttribute("aria-pressed")
    ).toBe("false");
  });

  it("marks 'Light' as pressed after clicking it", async () => {
    await renderToggle();
    await act(async () =>
      screen.getByRole("button", { name: /switch to light mode/i }).click()
    );
    expect(
      screen.getByRole("button", { name: /switch to light mode/i }).getAttribute("aria-pressed")
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: /use system theme preference/i }).getAttribute("aria-pressed")
    ).toBe("false");
  });

  it("marks 'Dark' as pressed after clicking it", async () => {
    await renderToggle();
    await act(async () =>
      screen.getByRole("button", { name: /switch to dark mode/i }).click()
    );
    expect(
      screen.getByRole("button", { name: /switch to dark mode/i }).getAttribute("aria-pressed")
    ).toBe("true");
  });

  it("marks 'System' as pressed after cycling back to it", async () => {
    await renderToggle();
    await act(async () =>
      screen.getByRole("button", { name: /switch to dark mode/i }).click()
    );
    await act(async () =>
      screen.getByRole("button", { name: /use system theme preference/i }).click()
    );
    expect(
      screen.getByRole("button", { name: /use system theme preference/i }).getAttribute("aria-pressed")
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: /switch to dark mode/i }).getAttribute("aria-pressed")
    ).toBe("false");
  });

  it("only ever has exactly one pressed button", async () => {
    await renderToggle();
    const assertOnePressed = () => {
      const pressed = screen
        .getAllByRole("button")
        .filter((b) => b.getAttribute("aria-pressed") === "true");
      expect(pressed).toHaveLength(1);
    };

    assertOnePressed();
    await act(async () =>
      screen.getByRole("button", { name: /switch to light mode/i }).click()
    );
    assertOnePressed();
    await act(async () =>
      screen.getByRole("button", { name: /switch to dark mode/i }).click()
    );
    assertOnePressed();
  });
});

describe("ThemeToggle — theme application to document", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
  });

  it("adds 'dark' class to <html> when Dark is clicked", async () => {
    await renderToggle();
    await act(async () =>
      screen.getByRole("button", { name: /switch to dark mode/i }).click()
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes 'dark' class from <html> when Light is clicked", async () => {
    document.documentElement.classList.add("dark");
    await renderToggle();
    await act(async () =>
      screen.getByRole("button", { name: /switch to light mode/i }).click()
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("applies dark theme when OS is dark and System is selected", async () => {
    await renderToggle(true); // OS dark
    // System is default → resolves to dark
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("ThemeToggle — localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
  });

  it("persists 'dark' to localStorage when Dark is clicked", async () => {
    await renderToggle();
    await act(async () =>
      screen.getByRole("button", { name: /switch to dark mode/i }).click()
    );
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("persists 'light' to localStorage when Light is clicked", async () => {
    await renderToggle();
    await act(async () =>
      screen.getByRole("button", { name: /switch to light mode/i }).click()
    );
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("persists 'system' to localStorage when System is clicked", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark"); // start on dark
    await renderToggle();
    await act(async () =>
      screen.getByRole("button", { name: /use system theme preference/i }).click()
    );
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });

  it("reads initial theme from localStorage on mount", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    await renderToggle();
    expect(
      screen.getByRole("button", { name: /switch to dark mode/i }).getAttribute("aria-pressed")
    ).toBe("true");
  });
});
