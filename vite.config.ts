import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const fromRoot = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    assetsDir: "static",
    rollupOptions: {
      input: {
        homepage: fromRoot("index.html"),
        yumChicken: fromRoot("YumChicken.html"),
        privacy: fromRoot("privacy.html"),
        support: fromRoot("support.html")
      }
    }
  }
});
