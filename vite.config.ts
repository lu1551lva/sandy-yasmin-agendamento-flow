import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development'
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // Diretório de saída para os arquivos de produção
    sourcemap: mode === "development", // Gera sourcemaps apenas no modo de desenvolvimento
    minify: "esbuild", // Usa esbuild para minificação (rápido e eficiente)
    rollupOptions: {
      output: {
        manualChunks: {
          // Dividir dependências em chunks separados para melhor cache
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
}));
