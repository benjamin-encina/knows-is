import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useCursos } from "./CursosContext";

// Carrito de compras, SEPARADO POR USUARIO.
// Se guarda en localStorage como { "<idUsuario>": [idCurso...], "invitado": [...] }.
// - Sin sesión se usa el carrito "invitado"; al iniciar sesión sus cursos pasan al carrito del usuario.
// - Guarda SOLO ids: precio y cupos se leen siempre de CursosContext para que estén al día.
// Limitación: vive en el navegador. Otra persona en el mismo navegador no ve tu carrito,
// pero tampoco se comparte entre dispositivos (eso requiere backend).
const CarritoContext = createContext(null);
const KEY_CARRITOS = "knowsis_carritos";
const INVITADO = "invitado";

const leer = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(KEY_CARRITOS));
    return guardado && typeof guardado === "object" && !Array.isArray(guardado) ? guardado : {};
  } catch {
    return {};
  }
};

export function CarritoProvider({ children }) {
  const { usuario } = useAuth();
  const { obtenerCurso } = useCursos();
  const [carritos, setCarritos] = useState(leer);

  const clave = usuario ? String(usuario.id) : INVITADO;
  const ids = carritos[clave] ?? [];

  useEffect(() => {
    try {
      localStorage.setItem(KEY_CARRITOS, JSON.stringify(carritos));
    } catch {
      /* sin almacenamiento disponible: el carrito vive solo en memoria */
    }
  }, [carritos]);

  // Al iniciar sesión, lo que se agregó como invitado pasa al carrito del usuario
  useEffect(() => {
    if (!usuario) return;
    setCarritos((c) => {
      const deInvitado = c[INVITADO] ?? [];
      if (deInvitado.length === 0) return c;
      const propios = c[clave] ?? [];
      const { [INVITADO]: _omitido, ...resto } = c;
      return { ...resto, [clave]: [...propios, ...deInvitado.filter((id) => !propios.includes(id))] };
    });
  }, [usuario, clave]);

  const actualizar = (cambiar) => setCarritos((c) => ({ ...c, [clave]: cambiar(c[clave] ?? []) }));

  // cursos del carrito (se descartan los que el admin ya eliminó)
  const items = ids.map(obtenerCurso).filter(Boolean);
  const total = items.reduce((suma, c) => suma + c.precio, 0);

  const agregar = (id) => actualizar((lista) => (lista.includes(id) ? lista : [...lista, id]));
  const quitar = (id) => actualizar((lista) => lista.filter((x) => x !== id));
  const vaciar = () => actualizar(() => []);
  const estaEnCarrito = (id) => ids.includes(id);

  return (
    <CarritoContext.Provider
      value={{ items, total, cantidad: items.length, agregar, quitar, vaciar, estaEnCarrito }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);
