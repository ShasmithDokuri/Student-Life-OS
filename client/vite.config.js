import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import oxlint from "vite-plugin-oxlint";

export default defineConfig({
  plugins: [react(), oxlint()],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});