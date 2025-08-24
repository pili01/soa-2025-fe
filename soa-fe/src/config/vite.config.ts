import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ors": {
        target: "https://api.openrouteservice.org",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ors/, ""),
      },
    },
  },
});
