import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Va dentro del Navbar, en el <div className="d-flex align-items-center gap-2">
// (reemplaza los botones fijos "Crear cuenta" y "Acceder").
export default function SesionNavbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) {
    return (
      <>
        <Link to="/registro" className="btn btn-tech-outline btn-sm text-nowrap">Crear cuenta</Link>
        <Link to="/login" className="btn btn-tech-primary btn-sm text-nowrap">Acceder</Link>
      </>
    );
  }
  return (
    <>
      <span className="small text-nowrap">Hola, <strong>{usuario.nombre.split(" ")[0]}</strong></span>
      <Link to="/perfil" className="btn btn-tech-outline btn-sm text-nowrap">
        <i className="bi bi-person-circle me-1"></i>Mi Perfil
      </Link>
      <button type="button" className="btn btn-tech-primary btn-sm text-nowrap"
        onClick={() => { logout(); navigate("/"); }}>
        Cerrar sesión
      </button>
    </>
  );
}