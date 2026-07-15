import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// loadEnv("../.");

// const HOST = process.env.HOST || "localhost";
// const PORT = process.env.PORT || 3000;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
    fs: { allow: [".", "../src/shared"] },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../src/shared"),
    },
  },
});
