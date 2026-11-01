import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

// Panel de administrador: sidebar fija + contenido de la ruta.
// Cada página admin dibuja su propia <AdminTopbar /> y su <div className="admin-content">.
//
// TODO (sección 4, autenticación): proteger este layout. Si no hay sesión de admin,
// redirigir a /login con <Navigate to="/login" replace />.
export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
