import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { categorias } from "../data/cursos";

const categoriasMenu = categorias.filter((c) => c.enMenu);

const claseNavLink = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false); // menú colapsable en móvil
  const [cursosAbierto, setCursosAbierto] = useState(false); // desplegable "Cursos"
  const dropdownRef = useRef(null);
  const location = useLocation();

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

            <div className="d-flex align-items-center gap-2">
              {/* PENDIENTE DE DECISIÓN DEL EQUIPO: el carrito quedó fuera del alcance.
                  Se mantiene igual que en la versión HTML hasta decidir si se quita o se implementa. */}
              <a
                href="#"
                className="link-tech d-flex align-items-center gap-1"
                aria-label="Carrito de compras (0 productos)"
                onClick={(e) => e.preventDefault()}
              >
                <i className="bi bi-cart3 fs-5"></i>
                <span className="small">Cart (0)</span>
              </a>

              {/* TODO (sección 4, autenticación): según la sesión, mostrar el nombre del usuario
                  y "Cerrar sesión" en lugar de estos dos botones. */}
              <Link to="/registro" className="btn btn-tech-outline btn-sm">
                Crear cuenta
              </Link>
              <Link to="/login" className="btn btn-tech-primary btn-sm">
                Acceder
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
