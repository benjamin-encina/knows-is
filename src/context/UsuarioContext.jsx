import { createContext, useContext, useEffect, useState } from "react";
import { usuarios as usuariosBase } from "../data/usuarios";

const UsuariosContext = createContext(null);
const KEY = "knowsis_usuarios_admin";
const KEY_REGISTRADOS = "knowsis_registrados"; // donde guarda /registro a los nuevos

const leer = (clave, defecto) => {
  try { return JSON.parse(localStorage.getItem(clave)) ?? defecto; } catch { return defecto; }
};

export function UsuariosProvider({ children }) {
  const [usuarios, setUsuarios] = useState(() => {
    const guardados = leer(KEY, null);
    return Array.isArray(guardados) ? guardados : [...usuariosBase, ...leer(KEY_REGISTRADOS, [])];
  });

  // guarda la lista cada vez que cambia
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(usuarios));
  }, [usuarios]);

  // trae a los que se registraron en /registro después de cargar la app
  const sincronizar = () => {
    const registrados = leer(KEY_REGISTRADOS, []);
    setUsuarios((lista) => {
      const nuevos = registrados.filter((r) => !lista.some((u) => String(u.id) === String(r.id)));
      return nuevos.length ? [...lista, ...nuevos] : lista;
    });
  };

  const obtenerUsuario = (id) => usuarios.find((u) => String(u.id) === String(id));

  const crearUsuario = (datos) => {
    const id = usuarios.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1;
    const nuevo = { estado: "Activo", ...datos, id };
    setUsuarios((lista) => [...lista, nuevo]);
    return nuevo;
  };

  const editarUsuario = (id, datos) => {
    setUsuarios((lista) => lista.map((u) => (String(u.id) === String(id) ? { ...u, ...datos } : u)));
  };

  const eliminarUsuario = (id) => {
    setUsuarios((lista) => lista.filter((u) => String(u.id) !== String(id)));
  };

  return (
    <UsuariosContext.Provider
      value={{ usuarios, sincronizar, obtenerUsuario, crearUsuario, editarUsuario, eliminarUsuario }}
    >
      {children}
    </UsuariosContext.Provider>
  );
}

   export const useUsuarios = () => useContext(UsuariosContext);