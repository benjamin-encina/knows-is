import { createContext, useContext, useEffect, useState } from "react";
import { cursos as cursosBase } from "../data/cursos";

// Estado compartido de cursos: lo leen el sitio público y el panel admin.
// Persiste en localStorage (sin base de datos), así que los cambios hechos desde el admin
// se mantienen al recargar. Los CUPOS de cada curso son los cupos TOTALES; los ocupados
// se calculan desde las órdenes de compra (ver ComprasContext).
const CursosContext = createContext(null);

// Si cambia la forma de los datos de ejemplo (data/cursos.js), subir el número de versión
// para que todos dejen de usar lo que quedó guardado en su navegador.
const KEY_CURSOS = "knowsis_cursos_v2";

const maxId = (lista) => lista.reduce((max, c) => Math.max(max, c.id), 0);

const leer = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(KEY_CURSOS));
    if (guardado && Array.isArray(guardado.cursos)) return guardado;
  } catch {
    /* dato corrupto o sin almacenamiento: se parte de los datos de ejemplo */
  }
  return { cursos: cursosBase, ultimoId: maxId(cursosBase) };
};

export function CursosProvider({ children }) {
  // ultimoId evita reutilizar el id de un curso eliminado (las órdenes antiguas apuntan a él)
  const [estado, setEstado] = useState(leer);
  const { cursos } = estado;

  useEffect(() => {
    try {
      localStorage.setItem(KEY_CURSOS, JSON.stringify(estado));
    } catch {
      /* sin almacenamiento disponible: los cursos viven solo en memoria */
    }
  }, [estado]);

  // Si el admin edita cursos en otra pestaña, esta se actualiza sola
  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key === KEY_CURSOS) setEstado(leer());
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);

  const obtenerCurso = (id) => cursos.find((c) => String(c.id) === String(id));

  const crearCurso = (datos) => {
    const id = Math.max(estado.ultimoId, maxId(cursos)) + 1;
    const nuevo = {
      destacado: false,
      nuevo: true,
      icono: "bi-journal-code",
      imagen: `https://picsum.photos/seed/knowsis-${datos.codigo}/480/270`,
      ...datos,
      id,
    };
    setEstado((s) => ({ cursos: [...s.cursos, nuevo], ultimoId: id }));
    return nuevo;
  };

  const editarCurso = (id, datos) => {
    setEstado((s) => ({
      ...s,
      cursos: s.cursos.map((c) => (String(c.id) === String(id) ? { ...c, ...datos } : c)),
    }));
  };

  const eliminarCurso = (id) => {
    setEstado((s) => ({ ...s, cursos: s.cursos.filter((c) => String(c.id) !== String(id)) }));
  };

  return (
    <CursosContext.Provider value={{ cursos, obtenerCurso, crearCurso, editarCurso, eliminarCurso }}>
      {children}
    </CursosContext.Provider>
  );
}

export const useCursos = () => useContext(CursosContext);
