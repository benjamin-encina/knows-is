import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Ruta protegida para cualquier usuario con sesión (checkout, mis cursos...).
// Sin sesión -> /login, y al ingresar el Login lo devuelve a la página que quería abrir.
export default function RutaUsuario() {
  const { usuario } = useAuth();
  const location = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  return <Outlet />;
}
