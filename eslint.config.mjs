import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // jsx-a11y recommended rules. The plugin is already registered by next;
  // add only rules here to avoid redefining the plugin.
  {
    rules: {
      ...jsxA11y.configs.recommended.rules,
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tests/e2e/**",
    "playwright-report/**",
    "scripts/**",
  ]),
]);

export default eslintConfig;
