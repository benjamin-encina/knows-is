import { api } from "./client";

// Frente B (usuarios). Todo exige rol Admin.

export const listarUsuarios = () => api.get("/api/usuarios");

export const obtenerUsuario = (id) => api.get(`/api/usuarios/${id}`);

export const crearUsuario = (datos) => api.post("/api/usuarios", datos);

/** En la edición, "contrasena" vacía o ausente significa "no cambiarla". */
export const editarUsuario = (id, datos) => api.put(`/api/usuarios/${id}`, datos);

export const eliminarUsuario = (id) => api.delete(`/api/usuarios/${id}`);
