import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    {
      name: "copy-sw",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "video-sw.js",
          source: require("fs").readFileSync(
            resolve(__dirname, "video-sw.js"),
            "utf-8"
          ),
        });
      },
    },
  ],

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        sw: resolve(__dirname, "video-sw.js"),
      },
    },
  },

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
