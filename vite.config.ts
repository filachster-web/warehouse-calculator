import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Замените "warehouse-calculator" на имя вашего репозитория на GitHub
const REPO_NAME = "warehouse-calculator";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? `/${REPO_NAME}/` : "/",
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
});
