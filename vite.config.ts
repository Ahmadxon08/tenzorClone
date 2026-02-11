import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
  },

  // 🔑 Shu qo'shildi – Router fallback
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["front-navoiy-azot-lms.tenzorsoft.uz"],

    strictPort: true,
  },
  optimizeDeps: {},
  base: "/",
});
