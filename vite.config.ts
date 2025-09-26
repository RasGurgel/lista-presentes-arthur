import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      // Corrigi o erro de digitação de _dirname para __dirname
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Adicionando a configuração de build para a Vercel
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
}));