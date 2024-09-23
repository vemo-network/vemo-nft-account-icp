import path, { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "es2020",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
  // define: {
  //   global: "globalThis",
  // },
  resolve: {
    alias: {
      process: "process/browser",
      util: "util",
      "@components": path.resolve(__dirname, "src/components"),
      src: path.resolve(__dirname, "src/"),
      "@": path.resolve(__dirname, "src/"),
      "@store": path.resolve(__dirname, "src/store"),
      "@context": path.resolve(__dirname, "src/context/"),

    },
  },
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  base: "/account",
});
