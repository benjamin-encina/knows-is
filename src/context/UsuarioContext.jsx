import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as usuariosApi from "../api/usuariosApi";
import { useAuth } from "./AuthContext";

const UsuariosContext = createContext(null);

// El backend entrega nombre y apellidos por separado; la interfaz también usa el nombre completo.
const normalizar = (u) => ({ ...u, nombreCompleto: [u.nombre, u.apellidos].filter(Boolean).join(" ") });

// Lo que se envía al backend. En la edición, sin "contrasena" significa "no cambiarla".
const paraApi = ({ nombreCompleto, ...datos }) => ({ ...datos, apellidos: null });

// Usuarios del panel de administración. Solo el rol Admin puede pedirlos al backend (GET /api/usuarios).
// Las funciones de crear, editar y eliminar son asíncronas y lanzan un ErrorApi si el backend rechaza algo
// (correo repetido, no eliminarse a sí mismo...): la pantalla que las llama muestra el mensaje.
export function UsuariosProvider({ children }) {
  const { esAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const recargar = useCallback(async () => {
    if (!esAdmin) {
      setUsuarios([]);
      setCargando(false);
      return;
    }
    setError("");
    try {
      const lista = await usuariosApi.listarUsuarios();
      setUsuarios(lista.map(normalizar));
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [esAdmin]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const obtenerUsuario = (id) => usuarios.find((u) => String(u.id) === String(id));

  const crearUsuario = async (datos) => {
    const nuevo = normalizar(await usuariosApi.crearUsuario(paraApi(datos)));
    setUsuarios((lista) => [...lista, nuevo]);
    return nuevo;
  };

  const editarUsuario = async (id, datos) => {
    const editado = normalizar(await usuariosApi.editarUsuario(id, paraApi(datos)));
    setUsuarios((lista) => lista.map((u) => (String(u.id) === String(id) ? editado : u)));
    return editado;
  };

  const eliminarUsuario = async (id) => {
    await usuariosApi.eliminarUsuario(id);
    setUsuarios((lista) => lista.filter((u) => String(u.id) !== String(id)));
  };

  return (
    <UsuariosContext.Provider
      value={{ usuarios, cargando, error, recargar, obtenerUsuario, crearUsuario, editarUsuario, eliminarUsuario }}
    >
      {children}
    </UsuariosContext.Provider>
  );
}

export const useUsuarios = () => useContext(UsuariosContext);