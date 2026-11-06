import { createContext, useContext, useState } from "react";
import { usuarios as usuariosBase } from "../data/usuarios";

const AuthContext = createContext(null);
const KEY_SESION = "knowsis_sesion";
const KEY_REGISTRADOS = "knowsis_registrados";

const leer = (clave, defecto) => {
  try { return JSON.parse(localStorage.getItem(clave)) ?? defecto; } catch { return defecto; }
};

export function AuthProvider({ children }) {
  // usuarios del mock (data/usuarios.js) + los que se registran desde /registro
  const [registrados, setRegistrados] = useState(() => leer(KEY_REGISTRADOS, []));
  const [usuario, setUsuario] = useState(() => leer(KEY_SESION, null));
  const todos = [...usuariosBase, ...registrados];

  const login = (correo, contrasena) => {
    const u = todos.find(
      (x) => x.correo.toLowerCase() === correo.trim().toLowerCase() && x.contrasena === contrasena
    );
    if (!u) return { ok: false, error: "Correo o contraseña incorrectos." };
    if (u.estado && u.estado !== "Activo") return { ok: false, error: "Tu cuenta está inactiva." };
    const { contrasena: _omitida, ...sesion } = u; // la contraseña no se guarda en la sesión
    setUsuario(sesion);
    localStorage.setItem(KEY_SESION, JSON.stringify(sesion));
    return { ok: true, usuario: sesion };
  };

  const registrar = (datos) => {
    if (todos.some((x) => x.correo.toLowerCase() === datos.correo.trim().toLowerCase())) {
      return { ok: false, error: "Ya existe una cuenta con ese correo." };
    }
    const nuevo = {
      ...datos,
      correo: datos.correo.trim(),
      id: Date.now(),
      rol: "Alumno",
      estado: "Activo",
    };
    const lista = [...registrados, nuevo];
    setRegistrados(lista);
    localStorage.setItem(KEY_REGISTRADOS, JSON.stringify(lista));
    return { ok: true };
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(KEY_SESION);
  };

  return (
    <AuthContext.Provider
      value={{ usuario, login, registrar, logout, estaLogueado: !!usuario, esAdmin: usuario?.rol === "Admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);