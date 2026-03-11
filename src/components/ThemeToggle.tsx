"use client";

import type { Theme } from "@/lib/theme";
import { useTheme } from "@/context/ThemeContext";

interface ThemeOption {
  value: Theme;
  label: string;
  ariaLabel: string;
  icon: React.ReactNode;
}

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    ariaLabel: "Switch to light mode",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    ariaLabel: "Switch to dark mode",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
  },
  {
    value: "system",
    label: "System",
    ariaLabel: "Use system theme preference",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex rounded-lg overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm"
      role="group"
      aria-label="Theme selector"
    >
      {themeOptions.map(({ value, label, ariaLabel, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={ariaLabel}
          aria-pressed={theme === value}
          title={ariaLabel}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-150 ${
            theme === value
              ? "bg-white text-blue-700 shadow-sm"
              : "text-white/80 hover:text-white hover:bg-white/15"
          }`}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
