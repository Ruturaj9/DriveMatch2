import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// ✅ Correct setup for Tailwind v4 + Vite 7
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // hooks Tailwind into Vite's CSS pipeline
  ],
});
