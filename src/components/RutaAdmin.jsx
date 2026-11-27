import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Ruta protegida: sin sesión -> /login; con sesión pero sin rol Admin -> /sin-permiso.
// El rol viene del backend (/api/auth/me). Esto mejora la experiencia; la seguridad real la pone el backend.
export default function RutaAdmin() {
  const { usuario, esAdmin } = useAuth();
  const location = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  if (!esAdmin) return <Navigate to="/sin-permiso" replace />;
  return <Outlet />;
}