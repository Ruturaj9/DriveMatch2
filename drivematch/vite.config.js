import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// FULL correct setup for Tailwind v4
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // <- This was missing
  ],
});
