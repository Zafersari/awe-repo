import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:3001",
    },
  },
  // Relative asset paths, so the build also works under a sub-path
  // like https://zafersari.github.io/awe-repo/ (GitHub Pages)
  base: "./",
});
