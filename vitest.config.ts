import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // Use the automatic JSX runtime so TSX files can be imported in tests
  // without an explicit `import React from 'react'`.
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    // happy-dom provides browser globals (window, document, localStorage)
    // without the jsdom 27 ESM/CJS interop issues caused by @csstools/css-calc.
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
