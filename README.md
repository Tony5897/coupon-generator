# OfferEngine — Digital Coupon Generator

A client-side digital coupon generator built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**. Generate discount codes with configurable percentages, custom codes, expiration dates, and scannable QR codes — all from the browser with zero backend required.

## Live Demo

[Open the app](https://coupon-generator-liard.vercel.app/)

## Features

- **Instant code generation** — Auto-generates unique alphanumeric coupon codes (e.g. `SAVE25-A8F3KL`) or accepts a fully custom code
- **Crypto-safe randomness** — Coupon suffixes use `crypto.getRandomValues` instead of `Math.random`
- **Expiration date picker** — Choose any future date; defaults to 30 days from generation
- **QR code output** — Each coupon renders a scannable QR code via `qrcode.react`
- **Clipboard copy** — One-click copy with visual confirmation and error fallback
- **Persistent storage** — Coupons are saved to `localStorage` and survive page reloads
- **Coupon management** — Delete individual coupons or clear all at once
- **Input validation** — Enforces discount range (1–100%), minimum custom code length, and future-only expiration dates
- **Light / Dark / System theme** — Three-mode toggle (Light, Dark, System) that mirrors the OS `prefers-color-scheme` preference, persists the choice to `localStorage`, and applies the correct theme class before React hydrates (no flash of unstyled content)
- **Responsive design** — Mobile-first layout that scales cleanly to desktop

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Runtime | React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3.4 (`darkMode: "class"`) |
| QR Codes | qrcode.react 4 |
| Fonts | Geist Sans / Geist Mono |
| Bundler | Turbopack (dev server) |
| Testing | Vitest 4 + Testing Library (React 16) + happy-dom |
| Linting | ESLint 9 (next/core-web-vitals + next/typescript) |
| CI | GitHub Actions (Node.js 20) |
| Deployment | Vercel |

## Getting Started

**Prerequisites:** Node.js 20+

```bash
# 1. Clone the repository
git clone https://github.com/Tony5897/coupon-generator.git
cd coupon-generator

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other commands

```bash
npm run build       # Production build
npm start           # Serve the production build
npm run lint        # ESLint
npm run type-check  # TypeScript (no emit)
npm test            # Run all tests once
npm run test:watch  # Run tests in watch mode
```

## Project Structure

```text
src/
├── app/
│   ├── globals.css           # Tailwind directives + light/dark CSS variables
│   ├── layout.tsx            # Root layout — ThemeProvider, FOUC script, fonts
│   └── page.tsx              # Home page
├── components/
│   ├── CouponForm.tsx        # Main form — generation, QR display, saved list
│   ├── ThemeToggle.tsx       # Light / Dark / System toggle button group
│   └── ThemeToggle.test.tsx  # Component tests (20)
├── context/
│   ├── ThemeContext.tsx      # React context provider + useTheme hook
│   └── ThemeContext.test.tsx # Provider / hook integration tests (20)
├── lib/
│   ├── coupons.ts            # Business logic — validation, generation, types
│   ├── coupons.test.ts       # Coupon utility unit tests (26)
│   ├── theme.ts              # Theme utilities — resolve, storage, DOM apply
│   └── theme.test.ts         # Theme utility tests (39)
└── test/
    └── setup.ts              # Vitest global setup — jest-dom matchers
```

## Testing

```bash
npm test            # Single run (used by CI)
npm run test:watch  # Interactive watch mode
```

**105 tests across 4 test files:**

| File | Coverage | Tests |
|---|---|---|
| `src/lib/coupons.test.ts` | Validation, code generation, expiration logic | 26 |
| `src/lib/theme.test.ts` | `resolveTheme`, localStorage, DOM class application, system preference | 39 |
| `src/context/ThemeContext.test.tsx` | Provider hydration, OS resolution, persistence, `useTheme` hook | 20 |
| `src/components/ThemeToggle.test.tsx` | Rendering, `aria-pressed` state, document class toggling, localStorage | 20 |

**Test stack:** Vitest 4 · @testing-library/react 16 · @testing-library/jest-dom · happy-dom

## CI Pipeline

GitHub Actions runs four sequential jobs on every push to `main`, `dev`, and `feat/*` branches, and on pull requests targeting `main` or `dev`:

```
Lint → Type Check → Test → Build
```

All jobs run on `ubuntu-latest` with Node.js 20 and npm dependency caching.

## Quality Gates

Every commit that reaches `main` passes:

- **ESLint** — Next.js core-web-vitals + TypeScript rules (flat config)
- **TypeScript** — strict mode, `noEmit`
- **Vitest** — 105 tests, zero failures
- **Next.js build** — clean production build with no type or lint errors
