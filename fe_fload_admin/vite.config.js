import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = (env.VITE_API_URL || "https://bebaolu.onrender.com").replace(/\/$/, "");

  return {
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
          target,
          changeOrigin: true,
          secure: false,
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
          target,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/upload-api/, ""),
        },
        "/uploads": {
          target,
          changeOrigin: true,
          secure: false,
        },
        "/api/uploads": {
          target,
          changeOrigin: true,
          secure: false,
        },
        "/geo": {
          target: "https://nominatim.openstreetmap.org",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/geo/, ""),
        },
      },
    },
  };
});
