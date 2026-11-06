import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Ruta protegida: sin sesión -> /login; con sesión pero sin rol admin -> inicio.
export default function RutaAdmin() {
  const { usuario, esAdmin } = useAuth();
  const location = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  if (!esAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}