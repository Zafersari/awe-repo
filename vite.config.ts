import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    {
      name: "react-sandbox-history-fallback",
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          const pathname = request.url?.split("?", 1)[0];
          const acceptsHtml = request.headers.accept?.includes("text/html");

          if (
            acceptsHtml &&
            pathname?.startsWith("/sandbox/react-intro/") &&
            !pathname.endsWith(".html")
          ) {
            request.url = "/sandbox/react-intro/index.html";
          }

          next();
        });
      },
    },
    react(),
  ],
  // Relative asset paths, so the build also works under a sub-path
  // like https://zafersari.github.io/awe-repo/ (GitHub Pages)
  base: "./",
});
