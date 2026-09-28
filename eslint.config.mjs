/*import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        fetch: "readonly",
      },
    },
  },
  pluginJs.configs.recommended,
];*/
import pluginJs from "@eslint/js";

export default [
    {
        ignores: ["dist/"]
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
                MutationObserver: "readonly"
            }
        }
    },
    pluginJs.configs.recommended,
];

