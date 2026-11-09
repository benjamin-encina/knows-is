/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false,
    include: ["src/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/pages/Login.jsx",
        "src/pages/Registro.jsx",
        "src/pages/Contacto.jsx",
        "src/pages/Checkout.jsx",
        "src/pages/admin/AdminCursoForm.jsx",
        "src/pages/admin/AdminUsuarioForm.jsx",
        "src/components/Campo.jsx",
        "src/hooks/useFormulario.js",
        "src/utils/**",
      ],
    },
  },
});
