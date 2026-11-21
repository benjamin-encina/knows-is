import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  listarCursos,
  crearCurso as crearCursoApi,
  editarCurso as editarCursoApi,
  eliminarCurso as eliminarCursoApi,
} from "../api/cursosApi";

const CursosContext = createContext(null);

// El backend (PUT) reemplaza el curso completo, así que siempre se envían TODOS los campos
// que acepta CursoRequest (si faltara alguno, se borraría en la base de datos).
const aCuerpo = (c) => ({
  codigo: c.codigo,
  nombre: c.nombre,
  descripcion: c.descripcion ?? "",
  precio: c.precio,
  cupos: c.cupos,
  cupoCritico: c.cupoCritico ?? null,
  categoria: c.categoria,
  nivel: c.nivel,
  instructor: c.instructor,
  imagen: c.imagen ?? null,
  icono: c.icono ?? null,
  destacado: Boolean(c.destacado),
  nuevo: Boolean(c.nuevo),
});

export function CursosProvider({ children }) {
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const recargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setCursos(await listarCursos());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  // Al abrir la app se piden los cursos al backend una vez
  useEffect(() => {
    recargar();
  }, [recargar]);

  const obtenerCurso = (id) => cursos.find((c) => String(c.id) === String(id));

  // crear, editar y eliminar son asíncronos: si el backend responde con error
  // (409, 422, 400...) lanzan un ErrorApi y quien los llama muestra el mensaje.
  const crearCurso = async (datos) => {
    const creado = await crearCursoApi(
      aCuerpo({ destacado: false, nuevo: true, icono: "bi-journal-code", ...datos })
    );
    setCursos((lista) => [...lista, creado]);
    return creado;
  };

  const editarCurso = async (id, datos) => {
    const actual = obtenerCurso(id);
    const actualizado = await editarCursoApi(id, aCuerpo({ ...actual, ...datos }));
    setCursos((lista) => lista.map((c) => (String(c.id) === String(id) ? actualizado : c)));
    return actualizado;
  };

  const eliminarCurso = async (id) => {
    await eliminarCursoApi(id);
    setCursos((lista) => lista.filter((c) => String(c.id) !== String(id)));
  };

  return (
    <CursosContext.Provider
      value={{ cursos, cargando, error, recargar, obtenerCurso, crearCurso, editarCurso, eliminarCurso }}
    >
      {children}
    </CursosContext.Provider>
  );
}

export const useCursos = () => useContext(CursosContext);