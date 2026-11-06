import { createContext, useContext, useState } from "react";
import { cursos as cursosBase } from "../data/cursos";

// Estado compartido de cursos: lo leen el sitio público y el panel admin.
// Por ahora vive en memoria (se reinicia al recargar); la persistencia se decide en el punto 7.
const CursosContext = createContext(null);

export function CursosProvider({ children }) {
  const [cursos, setCursos] = useState(cursosBase);

  const obtenerCurso = (id) => cursos.find((c) => String(c.id) === String(id));

  const crearCurso = (datos) => {
    const id = cursos.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const nuevo = {
      destacado: false,
      nuevo: true,
      icono: "bi-journal-code",
      imagen: `https://picsum.photos/seed/knowsis-${datos.codigo}/480/270`,
      ...datos,
      id,
    };
    setCursos((lista) => [...lista, nuevo]);
    return nuevo;
  };

  const editarCurso = (id, datos) => {
    setCursos((lista) => lista.map((c) => (String(c.id) === String(id) ? { ...c, ...datos } : c)));
  };

  const eliminarCurso = (id) => {
    setCursos((lista) => lista.filter((c) => String(c.id) !== String(id)));
  };

  return (
    <CursosContext.Provider value={{ cursos, obtenerCurso, crearCurso, editarCurso, eliminarCurso }}>
      {children}
    </CursosContext.Provider>
  );
}

export const useCursos = () => useContext(CursosContext);