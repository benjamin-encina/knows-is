import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { configurarAuth } from "../api/client";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);
const KEY_ACCESS = "knowsis_access_token";
const KEY_REFRESH = "knowsis_refresh_token";

// Claves del mock anterior: guardaban usuarios con contraseña en el navegador. Se eliminan.
const CLAVES_ANTIGUAS = ["knowsis_sesion", "knowsis_registrados"];

const leer = (clave) => {
  try { return localStorage.getItem(clave); } catch { return null; }
};
const escribir = (clave, valor) => {
  try {
    if (valor) localStorage.setItem(clave, valor);
    else localStorage.removeItem(clave);
  } catch { /* sin almacenamiento: la sesión dura hasta recargar */ }
};

// El backend entrega nombre y apellidos por separado; la interfaz usa también el nombre completo.
const normalizar = (u) => ({ ...u, nombreCompleto: [u.nombre, u.apellidos].filter(Boolean).join(" ") });

const mensajeLogin = (error) => {
  if (error.estado === 401) return "Correo o contraseña incorrectos.";
  if (error.estado === 403) return "Tu cuenta está inactiva.";
  return error.message;
};

export function AuthProvider({ children }) {
  // Los tokens viven en refs para que el cliente HTTP siempre lea el valor más reciente
  const access = useRef(leer(KEY_ACCESS));
  const refresh = useRef(leer(KEY_REFRESH));
  const [usuario, setUsuario] = useState(null);
  // Si hay tokens guardados, hay que preguntar al backend quién es antes de decidir nada
  const [cargando, setCargando] = useState(Boolean(access.current || refresh.current));

  const guardarTokens = useCallback((nuevoAccess, nuevoRefresh) => {
    access.current = nuevoAccess;
    refresh.current = nuevoRefresh;
    escribir(KEY_ACCESS, nuevoAccess);
    escribir(KEY_REFRESH, nuevoRefresh);
  }, []);

  const limpiarSesion = useCallback(() => {
    guardarTokens(null, null);
    setUsuario(null);
  }, [guardarTokens]);

  // Lo usa client.js cuando recibe un 401: cambia el refresh por un par nuevo
  const renovarSesion = useCallback(async () => {
    if (!refresh.current) return false;
    try {
      const sesion = await authApi.renovar(refresh.current);
      guardarTokens(sesion.accessToken, sesion.refreshToken);
      setUsuario(normalizar(sesion.usuario));
      return true;
    } catch {
      return false;
    }
  }, [guardarTokens]);

  // Al abrir la app: conecta el cliente HTTP con la sesión y restaura al usuario con /me
  useEffect(() => {
    CLAVES_ANTIGUAS.forEach((clave) => escribir(clave, null));
    configurarAuth({
      obtenerToken: () => access.current,
      renovarSesion,
      alSesionExpirada: limpiarSesion,
    });

    if (!access.current && !refresh.current) return undefined;

    let activo = true;
    (async () => {
      try {
        if (access.current) {
          const perfil = await authApi.obtenerPerfil(); // si el token venció, client.js renueva y repite
          if (activo) setUsuario(normalizar(perfil));
        } else if (!(await renovarSesion())) {
          limpiarSesion();
        }
      } catch {
        if (activo) limpiarSesion();
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [renovarSesion, limpiarSesion]);

  const login = async (correo, contrasena) => {
    try {
      const sesion = await authApi.login(correo.trim(), contrasena);
      guardarTokens(sesion.accessToken, sesion.refreshToken);
      const u = normalizar(sesion.usuario);
      setUsuario(u);
      return { ok: true, usuario: u };
    } catch (error) {
      return { ok: false, error: mensajeLogin(error) };
    }
  };

  const registrar = async (datos) => {
    try {
      await authApi.registrar(datos);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.estado === 409 ? "Ya existe una cuenta con ese correo." : error.message };
    }
  };

  const logout = async () => {
    const refreshActual = refresh.current;
    limpiarSesion();
    if (refreshActual) {
      try { await authApi.cerrarSesion(refreshActual); } catch { /* aunque falle, la sesión local ya se cerró */ }
    }
  };

  if (cargando) {
    return (
      <div className="d-flex vh-100 align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border" role="status" aria-hidden="true"></div>
          <p className="mt-3 mb-0">Cargando…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        registrar,
        logout,
        estaLogueado: !!usuario,
        esAdmin: usuario?.rol === "Admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);