import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useCarrito } from "./CarritoContext";
import { useCursos } from "./CursosContext";
import {
  anularOrden as anularOrdenApi,
  crearOrden,
  listarMisOrdenes,
  listarOrdenes,
  obtenerOrden as obtenerOrdenApi,
  obtenerResumenCupos,
} from "../api/ordenesApi";

// Órdenes de compra (frente C). Ahora TODO vive en el backend (/api/ordenes):
// - El servidor valida cupos, "ya inscrito", RUT y el pago, y calcula el total oficial.
// - Aquí solo se guardan en memoria las órdenes que devuelve la API (nada en localStorage).
// - Los datos de tarjeta se envían una sola vez al crear la orden y nunca se guardan en el navegador.
//
// CUPOS: los calcula el backend. Cada curso trae cuposOcupados y cuposDisponibles, y el admin
// pide el resumen a GET /api/admin/cupos. Después de comprar o anular se recargan los cursos.
const ComprasContext = createContext(null);

const masReciente = (a, b) => String(b.fecha).localeCompare(String(a.fecha));

export function ComprasProvider({ children }) {
  const { usuario } = useAuth();
  const { items, vaciar } = useCarrito();
  const { obtenerCurso, recargar: recargarCursos } = useCursos();

  const [misOrdenes, setMisOrdenes] = useState([]);
  const [cargandoMias, setCargandoMias] = useState(false);
  const [errorMias, setErrorMias] = useState("");

  const [ordenes, setOrdenes] = useState([]);          // todas (solo admin)
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);
  const [errorOrdenes, setErrorOrdenes] = useState("");

  const [resumenCupos, setResumenCupos] = useState(null);
  const [errorCupos, setErrorCupos] = useState("");

  const recargarMisOrdenes = useCallback(async () => {
    if (!usuario) {
      setMisOrdenes([]);
      return;
    }
    setCargandoMias(true);
    setErrorMias("");
    try {
      setMisOrdenes(await listarMisOrdenes());
    } catch (e) {
      setErrorMias(e.message);
    } finally {
      setCargandoMias(false);
    }
  }, [usuario]);

  // Al iniciar o cambiar la sesión se piden las órdenes del usuario
  useEffect(() => {
    recargarMisOrdenes();
  }, [recargarMisOrdenes]);

  // ---------------------------------------------------------------- admin
  const cargarOrdenes = useCallback(async () => {
    setCargandoOrdenes(true);
    setErrorOrdenes("");
    try {
      setOrdenes(await listarOrdenes());
    } catch (e) {
      setErrorOrdenes(e.message);
    } finally {
      setCargandoOrdenes(false);
    }
  }, []);

  const cargarResumenCupos = useCallback(async () => {
    setErrorCupos("");
    try {
      setResumenCupos(await obtenerResumenCupos());
    } catch (e) {
      setErrorCupos(e.message);
    }
  }, []);

  /** Anula una orden (solo Admin). Lanza ErrorApi si el backend la rechaza. */
  const anularOrden = async (id) => {
    const anulada = await anularOrdenApi(id);
    setOrdenes((lista) => lista.map((o) => (o.id === id ? anulada : o)));
    setMisOrdenes((lista) => lista.map((o) => (o.id === id ? anulada : o)));
    // el cupo se libera en el servidor: se actualizan los contadores
    cargarResumenCupos();
    recargarCursos?.();
    return anulada;
  };

  // ---------------------------------------------------------------- vista del usuario
  const ordenesUsuario = useMemo(() => [...misOrdenes].sort(masReciente), [misOrdenes]);
  const todasLasOrdenes = useMemo(() => [...ordenes].sort(masReciente), [ordenes]);

  // Cupos que informa el backend en cada curso (cuposOcupados / cuposDisponibles)
  const ocupadosDe = (cursoId) => obtenerCurso(cursoId)?.cuposOcupados ?? 0;
  const disponiblesDe = (curso) =>
    Math.max(0, curso.cuposDisponibles ?? curso.cupos - (curso.cuposOcupados ?? 0));

  // Inscrito = el curso está en una orden Pagada (una orden Anulada libera el curso)
  const yaAdquirido = (cursoId) =>
    ordenesUsuario.some(
      (o) => o.estado === "Pagada" && o.items.some((i) => String(i.cursoId) === String(cursoId))
    );

  // Revisión previa en el navegador, solo para avisar antes de pagar.
  // La validación que vale es la del servidor al crear la orden.
  const validarItem = (curso) => {
    if (!curso) return "Este curso ya no está disponible.";
    if (yaAdquirido(curso.id)) return "Ya estás inscrito en este curso.";
    if (disponiblesDe(curso) <= 0) return "Este curso se quedó sin cupos.";
    return "";
  };

  const validarCarrito = () => {
    for (const curso of items) {
      const problema = validarItem(curso);
      if (problema) return `${curso.nombre}: ${problema}`;
    }
    return "";
  };

  // Busca primero entre las órdenes ya cargadas
  const obtenerOrden = (id) =>
    ordenesUsuario.find((o) => o.id === id) ?? todasLasOrdenes.find((o) => o.id === id);

  /** Pide la orden al backend (dueño o Admin). Útil si se recarga la página de éxito. */
  const buscarOrden = async (id) => obtenerOrden(id) ?? obtenerOrdenApi(id);

  /**
   * Crea la orden en el servidor: { facturacion, cuotas, tarjeta }.
   * El servidor cobra (pago simulado), calcula el total y devuelve la orden oficial.
   * Devuelve { ok: true, orden } o { ok: false, error } con el mensaje del backend
   * (ya inscrito, sin cupos, pago rechazado, RUT inválido...).
   */
  const confirmarCompra = async ({ facturacion, cuotas, tarjeta }) => {
    if (!usuario) return { ok: false, error: "Debes iniciar sesión para comprar." };
    if (items.length === 0) return { ok: false, error: "Tu carrito está vacío." };

    try {
      const orden = await crearOrden({ cursoIds: items.map((c) => c.id), cuotas, facturacion, tarjeta });
      setMisOrdenes((lista) => [orden, ...lista.filter((o) => o.id !== orden.id)]);
      vaciar();
      recargarCursos?.(); // los cupos ocupados cambiaron en el servidor
      return { ok: true, orden };
    } catch (e) {
      return { ok: false, error: e.message, estado: e.estado };
    }
  };

  return (
    <ComprasContext.Provider
      value={{
        ordenesUsuario, cargandoMias, errorMias, recargarMisOrdenes,
        todasLasOrdenes, cargandoOrdenes, errorOrdenes, cargarOrdenes, anularOrden,
        resumenCupos, errorCupos, cargarResumenCupos,
        ocupadosDe, disponiblesDe, yaAdquirido, validarItem, validarCarrito,
        obtenerOrden, buscarOrden, confirmarCompra,
      }}
    >
      {children}
    </ComprasContext.Provider>
  );
}

export const useCompras = () => useContext(ComprasContext);
