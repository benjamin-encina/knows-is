import { Link, NavLink } from "react-router-dom";

const claseAdminLink = ({ isActive }) => "admin-nav-link" + (isActive ? " active" : "");

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <Link to="/admin" className="navbar-brand">
        <span className="brand-mark">&lt;/&gt;</span> Knows-IS
      </Link>

      {/* "end" evita que Dashboard quede activo en todas las rutas /admin/... */}
      <NavLink to="/admin" end className={claseAdminLink}>
        <i className="bi bi-grid"></i> Dashboard
      </NavLink>
      <NavLink to="/admin/cursos" className={claseAdminLink}>
        <i className="bi bi-mortarboard"></i> Cursos
      </NavLink>
      <NavLink to="/admin/usuarios" className={claseAdminLink}>
        <i className="bi bi-people"></i> Usuarios
      </NavLink>

      <div className="admin-nav-divider">
        {/* Configuración no tiene página todavía (igual que en la versión HTML) */}
        <a href="#" className="admin-nav-link" onClick={(e) => e.preventDefault()}>
          <i className="bi bi-gear"></i> Configuración
        </a>
        <Link to="/" className="admin-nav-link">
          <i className="bi bi-box-arrow-left"></i> Salir al sitio
        </Link>
      </div>
    </aside>
  );
}
