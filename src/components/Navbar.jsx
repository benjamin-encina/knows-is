import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { categorias } from "../data/cursos";
import SesionNavbar from "./SesionNavbar";
import { useCarrito } from "../context/CarritoContext";

const categoriasMenu = categorias.filter((c) => c.enMenu);

const claseNavLink = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false); // menú colapsable en móvil
  const [cursosAbierto, setCursosAbierto] = useState(false); // desplegable "Cursos"
  const dropdownRef = useRef(null);
  const location = useLocation();
  const { cantidad } = useCarrito();

  // Cierra los menús en cada navegación (location.key cambia incluso si solo cambia el ?query)
  useEffect(() => {
    setMenuAbierto(false);
    setCursosAbierto(false);
  }, [location.key]);

  // Cierra el desplegable al hacer clic fuera de él
  useEffect(() => {
    function alClicFuera(evento) {
      if (dropdownRef.current && !dropdownRef.current.contains(evento.target)) {
        setCursosAbierto(false);
      }
    }
    document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, []);

  const enCursos = location.pathname.startsWith("/cursos");

  return (
    <header className="site-header">
      <nav className="navbar navbar-expand-lg navbar-tech">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <span className="brand-mark">&lt;/&gt;</span> Knows-IS
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navMenu"
            aria-expanded={menuAbierto}
            aria-label="Abrir menú de navegación"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={"collapse navbar-collapse" + (menuAbierto ? " show" : "")} id="navMenu">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item">
                <NavLink to="/" end className={claseNavLink}>
                  Home
                </NavLink>
              </li>

              <li className="nav-item dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className={"nav-link dropdown-toggle" + (enCursos ? " active" : "")}
                  aria-expanded={cursosAbierto}
                  onClick={() => setCursosAbierto((abierto) => !abierto)}
                >
                  Cursos
                </button>
                <ul
                  className={"dropdown-menu" + (cursosAbierto ? " show" : "")}
                  data-bs-popper="static"
                >
                  {categoriasMenu.map((categoria) => (
                    <li key={categoria.slug}>
                      <Link className="dropdown-item" to={`/cursos?categoria=${categoria.slug}`}>
                        {categoria.nombre}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/cursos">
                      Ver todos los cursos
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <NavLink to="/nosotros" className={claseNavLink}>
                  Nosotros
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contacto" className={claseNavLink}>
                  Contacto
                </NavLink>
              </li>
            </ul>

            <div className="d-flex align-items-center flex-wrap gap-2 mt-3 mt-lg-0">
              <Link
                to="/carrito"
                className="link-tech d-flex align-items-center gap-1 text-nowrap"
                aria-label={`Carrito de compras (${cantidad} ${cantidad === 1 ? "curso" : "cursos"})`}
              >
                <i className="bi bi-cart3 fs-5"></i>
                <span className="small">Cart ({cantidad})</span>
              </Link>

              <SesionNavbar />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}