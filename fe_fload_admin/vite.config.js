import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  base: "/",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        bypass(req) {
          if (
            req.url.startsWith("/api/axios") ||
            req.url.startsWith("/api/firebase") ||
            req.url.endsWith(".js") ||
            req.url.endsWith(".jsx") ||
            req.url.endsWith(".ts") ||
            req.url.endsWith(".tsx") ||
            req.headers.accept?.includes("text/javascript")
          ) {
            return req.url;
          }
        },
      },
      "/upload-api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload-api/, ""),
      },
      "/uploads": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/api/uploads": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/geo": {
        target: "https://nominatim.openstreetmap.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geo/, ""),
      },
    },
  },
});
