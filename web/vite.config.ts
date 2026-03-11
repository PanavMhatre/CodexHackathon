import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    cssCodeSplit: false,
    emptyOutDir: true,
    lib: {
      entry: "src/main.tsx",
      formats: ["es"],
      fileName: () => "widget.js",
      cssFileName: "widget"
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => (assetInfo.name === "style.css" ? "widget.css" : "assets/[name][extname]")
      }
    }
  },
  server: {
    port: 5173
  }
});
