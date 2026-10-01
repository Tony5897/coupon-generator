# OfferEngine — Digital Coupon Generator

A client-side digital coupon generator built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Generate discount codes with configurable percentages, custom codes, expiration dates, and scannable QR codes — all from the browser with zero backend required.

## Live Demo

[Open the app](https://coupon-generator-liard.vercel.app/)

## Features

- **Code generation** — Generates random alphanumeric coupon codes (e.g. `SAVE25-A8F3KL`) or accepts custom codes; uniqueness is not guaranteed
- **Crypto-safe randomness** — Coupon suffixes use `crypto.getRandomValues` instead of `Math.random`
- **QR code output** — Each generated coupon renders a scannable QR code via `qrcode.react`
- **Clipboard copy** — One-click copy-to-clipboard with visual confirmation and error fallback
- **Persistent storage** — Coupons are saved to `localStorage` and persist across sessions
- **Coupon management** — Delete individual coupons or clear all at once
- **Input validation** — Whole-number discount range (1–100%), minimum trimmed custom code length, and expiration dates of today or later
- **Responsive design** — Mobile-first layout that scales cleanly to desktop

## Review locally

[Recorded checks and limitations](REVIEW.md)

Use Node 22.12+ (Node 22 LTS) and npm 10 or 11. No environment variables, API keys, database, or account are required.

```bash
git clone --branch main https://github.com/Tony5897/coupon-generator.git
cd coupon-generator
npm ci
npm run dev
```

Open http://localhost:3000. For a production preview, stop the development server, run `npm run build`, then `npm start`. Do not run development and production builds against the same `.next` directory concurrently.

```bash
npm run lint
npm run type-check
npm test
npm run build
```

Try generating a random code, then a custom code; reload to check local persistence, copy the code, delete a saved entry, and clear the list. Inspect [generation and validation](src/lib/coupons.ts), [storage/clipboard failure tests](src/components/CouponForm.test.tsx), and [calendar boundary tests](src/lib/coupon-boundaries.test.ts).

The QR contains the code string only, not a checkout URL or redemption service. Dates are local calendar dates, defaulting to 30 days ahead. Expiration is recorded metadata; the app neither removes expired coupons automatically nor enforces merchant redemption. There is no payment integration, server database, or merchant agreement. Random suffixes reduce collisions but do not enforce uniqueness.

Coupons are stored under `coupons` in this browser's localStorage. Clearing browser data removes them. Denied storage or malformed data leaves new coupons in memory for the current session; write failures display a warning. Clipboard failures display manual-copy guidance. These are demonstration codes, not secrets or guaranteed redeemable offers.

## Implementation stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| QR Codes | `qrcode.react` 4 |
| Testing | Vitest |
| Fonts | Geist Sans / Geist Mono |
| Bundler | Turbopack (development) |
| CI | GitHub Actions |
| Deployment | Vercel |

## Quality

- ESLint for linting
- TypeScript type-checking
- Vitest unit tests
- GitHub Actions CI pipeline for lint, type-check, test, and build
- Production deployment on Vercel

## Project Structure

```text
src/
├── app/
│   ├── globals.css           # Tailwind directives and CSS variables
│   ├── layout.tsx            # Root layout with metadata and fonts
│   └── page.tsx              # Home page — renders CouponForm
├── components/
│   └── CouponForm.tsx        # UI component — form, QR display, saved list
└── lib/
    ├── coupons.ts            # Business logic — validation, generation, types
    └── coupons.test.ts       # Unit tests for coupon utilities
```
