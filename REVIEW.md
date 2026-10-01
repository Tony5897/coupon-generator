# Local verification record

October 1, 2026. Baseline: `0b90aacde4bcec49aaf3e8ab0e84db3d7d295968`.
Results apply to the local review patch on `feat/reviewable-repository`, not the
unchanged baseline or live deployment. Record and retest the resulting commit
when publishing.

Node 22.23.2, npm 10.9.8, macOS arm64:

```sh
npm ci
npm run lint
npm run type-check
npm test
npm run build
npm audit
```

Passed: clean install, lint, type-check, 122 tests in six files, production build.
Full audit: zero reported advisories at review time. Next stays on major 15;
Vitest moved to patched major 4, with Vite on patched major 6. Package advisories
are not proof of deployed exploitation, and a clear audit is not a security guarantee.

New regression coverage covers local-date expiration boundaries, malformed or
unavailable storage, quota errors, unavailable/rejected clipboard access, and
the generated expiration after deleting a saved coupon. Chromium verified custom
generation, persistence after reload, deletion, copy-button interaction, and
clear-all against a local production build. Clipboard denial is verified by mocks;
no merchant checkout or actual coupon redemption is involved.

No environment variables or account are required. Expiration is metadata, QR
contents are code strings, and random suffixes do not enforce uniqueness.
