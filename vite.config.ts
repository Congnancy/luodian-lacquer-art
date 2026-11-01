import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/luodian-lacquer-art/" : "/",
  plugins: [react()],
}));
