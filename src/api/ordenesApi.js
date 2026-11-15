import { api } from "./client";

// Frente C (compras). Todo exige sesión; las rutas de administración exigen rol Admin.

/** datos: { cursoIds, cuotas, facturacion: {...}, tarjeta: {...} } — el servidor calcula precios y total */
export const crearOrden = (datos) => api.post("/api/ordenes", datos);

export const listarMisOrdenes = () => api.get("/api/ordenes/mias");

/** El id de una orden es su número, por ejemplo "KS-00001". */
export const obtenerOrden = (id) => api.get(`/api/ordenes/${id}`);

export const listarOrdenes = () => api.get("/api/ordenes");

export const anularOrden = (id) => api.patch(`/api/ordenes/${id}/anular`);

export const obtenerResumenCupos = () => api.get("/api/admin/cupos");
