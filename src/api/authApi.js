import { api } from "./client";

// Frente B (autenticación). Rutas definidas en docs/contrato-api.md del backend.
// Las rutas públicas llevan { auth: false }: no envían token (y así no intentan renovar la sesión).

export const login = (correo, contrasena) =>
  api.post("/api/auth/login", { correo, contrasena }, { auth: false });

export const registrar = (datos) => api.post("/api/auth/register", datos, { auth: false });

export const renovar = (refreshToken) => api.post("/api/auth/refresh", { refreshToken }, { auth: false });

export const cerrarSesion = (refreshToken) => api.post("/api/auth/logout", { refreshToken }, { auth: false });

export const obtenerPerfil = () => api.get("/api/auth/me");
