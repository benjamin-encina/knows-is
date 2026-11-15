import { api } from "./client";

// Frente A (cursos). Listar y ver son públicos; crear, editar y eliminar exigen rol Admin.

/** filtros opcionales: { categoria: "redes", nivel: "Inicial", q: "java" } */
export const listarCursos = (filtros) => api.get("/api/cursos", { params: filtros, auth: false });

export const obtenerCurso = (id) => api.get(`/api/cursos/${id}`, { auth: false });

export const listarCategorias = () => api.get("/api/categorias", { auth: false });

export const crearCurso = (datos) => api.post("/api/cursos", datos);

export const editarCurso = (id, datos) => api.put(`/api/cursos/${id}`, datos);

export const eliminarCurso = (id) => api.delete(`/api/cursos/${id}`);
