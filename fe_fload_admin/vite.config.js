// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path";

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      "/upload-api": {
        target: "https://api-rescue.purintech.id.vn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload-api/, ""),
      },
      "/uploads": {
        target: "https://api-rescue.purintech.id.vn",
        changeOrigin: true,
      },
      "/api/uploads": {
        target: "https://api-rescue.purintech.id.vn",
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