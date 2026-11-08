import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useCarrito } from "./CarritoContext";
import { planPago } from "../utils/pagos";

// Órdenes de compra (adquisiciones). Una orden guarda una "foto" de los cursos al momento
// de pagar (nombre, precio...), así el historial no cambia si el admin edita o borra el curso.
// Persiste en localStorage. NUNCA se guardan datos de tarjeta, solo los últimos 4 dígitos.
//
// CUPOS: curso.cupos son los cupos TOTALES. Los OCUPADOS se calculan contando los cursos de
// las órdenes pagadas, y los DISPONIBLES son totales - ocupados. Al ser un valor derivado,
// no hay que "descontar" nada: cada compra nueva actualiza el conteo sola.
const ComprasContext = createContext(null);
const KEY_ORDENES = "knowsis_ordenes";

const leer = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(KEY_ORDENES));
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
};

const masReciente = (a, b) => b.fecha.localeCompare(a.fecha);

export function ComprasProvider({ children }) {
  const { usuario } = useAuth();
  const { items, total: subtotal, vaciar } = useCarrito();
  const [ordenes, setOrdenes] = useState(leer);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_ORDENES, JSON.stringify(ordenes));
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [ordenes]);

  // Si alguien compra en otra pestaña, esta se actualiza sola (útil con el admin abierto aparte)
  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key === KEY_ORDENES) setOrdenes(leer());
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);

  const todasLasOrdenes = useMemo(() => [...ordenes].sort(masReciente), [ordenes]);

  // órdenes del usuario con sesión iniciada
  const ordenesUsuario = useMemo(
    () => (usuario ? todasLasOrdenes.filter((o) => o.usuarioId === usuario.id) : []),
    [todasLasOrdenes, usuario]
  );

  // { idCurso: cantidad de cupos ocupados }
  const ocupados = useMemo(() => {
    const conteo = {};
    ordenes
      .filter((o) => o.estado === "Pagada")
      .forEach((o) => o.items.forEach((i) => { conteo[i.cursoId] = (conteo[i.cursoId] || 0) + 1; }));
    return conteo;
  }, [ordenes]);

  const ocupadosDe = (cursoId) => ocupados[cursoId] || 0;
  const disponiblesDe = (curso) => Math.max(0, curso.cupos - ocupadosDe(curso.id));

  const yaAdquirido = (cursoId) =>
    ordenesUsuario.some((o) => o.items.some((i) => i.cursoId === cursoId));

  // Devuelve un mensaje de error si el curso no se puede comprar, o "" si está todo bien
  const validarItem = (curso) => {
    if (!curso) return "Este curso ya no está disponible.";
    if (yaAdquirido(curso.id)) return "Ya estás inscrito en este curso.";
    if (disponiblesDe(curso) <= 0) return "Este curso se quedó sin cupos.";
    return "";
  };

  // Revisa todo el carrito antes de cobrar
  const validarCarrito = () => {
    for (const curso of items) {
      const problema = validarItem(curso);
      if (problema) return `${curso.nombre}: ${problema}`;
    }
    return "";
  };

  const obtenerOrden = (id) => ordenesUsuario.find((o) => o.id === id);

  // Crea la orden y vacía el carrito. Se llama DESPUÉS de que el pago fue aprobado.
  // Los cupos ocupados suben solos porque se calculan desde las órdenes.
  const confirmarCompra = ({ facturacion, cuotas, pago }) => {
    if (!usuario) return { ok: false, error: "Debes iniciar sesión para comprar." };
    if (items.length === 0) return { ok: false, error: "Tu carrito está vacío." };
    const problema = validarCarrito();
    if (problema) return { ok: false, error: problema };

    const plan = planPago(subtotal, cuotas);
    const ultimoNumero = ordenes.reduce((max, o) => Math.max(max, Number(o.id.replace("KS-", "")) || 0), 0);
    const orden = {
      id: `KS-${String(ultimoNumero + 1).padStart(5, "0")}`,
      usuarioId: usuario.id,
      fecha: new Date().toISOString(),
      items: items.map((c) => ({
        cursoId: c.id,
        codigo: c.codigo,
        nombre: c.nombre,
        instructor: c.instructor,
        categoria: c.categoria,
        precio: c.precio,
      })),
      subtotal: plan.subtotal,
      descuento: plan.descuento,
      total: plan.total, // lo que efectivamente paga (subtotal - descuento)
      cuotas: plan.cuotas,
      primeraCuota: plan.primeraCuota,
      valorCuota: plan.valorCuota,
      facturacion, // { nombre, correo, telefono, rut, direccion }
      pago, // { medio: "Tarjeta •••• 4242", referencia: "PAY-..." }
      estado: "Pagada",
    };

    setOrdenes((lista) => [...lista, orden]);
    vaciar();
    return { ok: true, orden };
  };

  return (
    <ComprasContext.Provider
      value={{
        todasLasOrdenes, ordenesUsuario, ocupadosDe, disponiblesDe,
        yaAdquirido, validarItem, validarCarrito, obtenerOrden, confirmarCompra,
      }}
    >
      {children}
    </ComprasContext.Provider>
  );
}

export const useCompras = () => useContext(ComprasContext);
