import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    open: false,
    fs: {
      // Allow importing deployments/<chain>.json from the repo root.
      allow: [path.resolve(__dirname, ".."), __dirname],
    },
  },
});
