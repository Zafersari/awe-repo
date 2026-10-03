import js from "@eslint/js";
import tseslint from "typescript-eslint";

const browserGlobals = {
  document: "readonly",
  window: "readonly",
  console: "readonly",
  fetch: "readonly",
  setTimeout: "readonly",
  localStorage: "readonly",
  alert: "readonly",
  MutationObserver: "readonly",
};

export default tseslint.config(
  { ignores: ["dist/**"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: browserGlobals,
    },
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs,cjs}"],
  },
  ...tseslint.configs.recommended,
);
