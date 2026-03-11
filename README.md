# OfferEngine — Digital Coupon Generator

A client-side digital coupon generator built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Generate discount codes with configurable percentages, custom codes, expiration dates, and scannable QR codes — all from the browser with zero backend required.

## Live Demo

[Open the app](https://coupon-generator-liard.vercel.app/)

## Features

- **Instant code generation** — Auto-generates unique alphanumeric coupon codes (e.g. `SAVE25-A8F3KL`) or accepts custom codes
- **Crypto-safe randomness** — Coupon suffixes use `crypto.getRandomValues` instead of `Math.random`
- **QR code output** — Each generated coupon renders a scannable QR code via `qrcode.react`
- **Clipboard copy** — One-click copy-to-clipboard with visual confirmation and error fallback
- **Persistent storage** — Coupons are saved to `localStorage` and persist across sessions
- **Coupon management** — Delete individual coupons or clear all at once
- **Input validation** — Discount range (1–100%), minimum custom code length, and future-only expiration dates
- **Responsive design** — Mobile-first layout that scales cleanly to desktop

## Tech Stack

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
