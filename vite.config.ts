import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import weddingConfig from "./src/config/wedding.config";
import { weddingMeta } from "./build/wedding-meta";

export default defineConfig({
  plugins: [react(), weddingMeta(weddingConfig, __dirname)],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: { port: 5173, host: true },
});
