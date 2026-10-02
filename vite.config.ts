import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths, so the build also works under a sub-path
  // like https://zafersari.github.io/awe-repo/ (GitHub Pages)
  base: "./",
});
