import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // accessible depuis le réseau local (test sur téléphone Android réel)
    port: 5173,
  },
});
