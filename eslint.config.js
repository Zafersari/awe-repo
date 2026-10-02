import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint"; // 1. Import typescript-eslint

export default [
  {
    ignores: ["dist/"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        localStorage: "readonly",
        alert: "readonly",
        MutationObserver: "readonly",
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended, // 2. Spread the recommended TS configs here
];