import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "generated/**",
    // Vendored shadcn/mapcn registry component — same "generated, not
    // hand-authored" status as generated/**, and its imperative MapLibre
    // integration code (latest-ref callbacks, listener setup in useMemo)
    // predates this project's stricter react-hooks/refs rule.
    "components/ui/map.tsx",
  ]),
]);

export default eslintConfig;
