import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const page = (name) => fileURLToPath(new URL(name, import.meta.url));
export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      input: {
        index: page("index.html"),
        privacy: page("privacy.html"),
        support: page("support.html"),
      },
    },
  },
});
