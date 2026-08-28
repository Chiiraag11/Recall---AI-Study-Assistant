import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // The client never talks to Gemini directly - it only ever calls our
      // own backend, which holds the API key. In dev, Vite proxies /api to
      // the Express server so there's no CORS setup to worry about; in
      // production you'd deploy the server behind the same domain (or
      // configure CORS + VITE_API_BASE, see README).
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "node",
  },
});
