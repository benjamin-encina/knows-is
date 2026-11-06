import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Va dentro del Navbar, en el <div className="d-flex align-items-center gap-2">
// (reemplaza los botones fijos "Crear cuenta" y "Acceder").
export default function SesionNavbar() {
  const { usuario, esAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) {
    return (
      <>
        <Link to="/registro" className="btn btn-tech-outline btn-sm">Crear cuenta</Link>
        <Link to="/login" className="btn btn-tech-primary btn-sm">Acceder</Link>
      </>
    );
  }
  return (
    <>
      <span className="small">Hola, <strong>{usuario.nombre.split(" ")[0]}</strong></span>
      {esAdmin && <Link to="/admin" className="btn btn-tech-outline btn-sm">Panel admin</Link>}
      <button type="button" className="btn btn-tech-primary btn-sm"
        onClick={() => { logout(); navigate("/"); }}>
        Cerrar sesión
      </button>
    </>
  );
}