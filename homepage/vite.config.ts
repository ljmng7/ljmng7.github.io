import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const fromRoot = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig({
  base: "/",
  plugins: [react(), {
    name: "play-directory-entry",
    enforce: "post",
    generateBundle(_, bundle) {
      const play = bundle["play.html"];
      if (play?.type === "asset") {
        this.emitFile({ type: "asset", fileName: "play/index.html", source: play.source });
      }
    }
  }],
  build: {
    assetsDir: "static",
    rollupOptions: {
      input: {
        homepage: fromRoot("index.html"),
        play: fromRoot("play.html")
      }
    }
  }
});
