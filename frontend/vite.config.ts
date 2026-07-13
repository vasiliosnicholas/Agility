import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
  },
});
