import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import netlifyPlugin from "@netlify/vite-plugin-react-router";

export default defineConfig({
  plugins: [
    {
      name: "copy-sw",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "video-sw.js",
          source: readFileSync(resolve(__dirname, "video-sw.js"), "utf-8"),
        });
      },
    },
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    netlifyPlugin(),
  ],

  server: {
    headers: {
      "Service-Worker-Allowed": "/",
    },
    proxy: {
      "/static": {
        target: "https://cdn.kinestex.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/static/, ""),
      },
      "/test": {
        target: "https://test-videos.co.uk",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/test/, ""),
      },
    },
  },
});
