import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Dividir librerías grandes como React o Axios
          vendor: ["react", "react-dom", "axios"]
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Cambiar el límite de advertencia
  }
});