import { Link } from "react-router-dom";

// compacto = versión mínima (solo la franja inferior), usada en login y registro
export default function Footer({ compacto = false }) {
  const anio = new Date().getFullYear();

  const franjaInferior = (
    <div
      className="footer-bottom d-flex justify-content-between flex-wrap gap-2"
      style={compacto ? { borderTop: "none", marginTop: 0 } : undefined}
    >
      <span>© {anio} Knows-IS.</span>
      <span>Benjamín · Kevin · Ghislane</span>
    </div>
  );

  if (compacto) {
    return (
      <footer className="footer-tech" style={{ padding: "2rem 0" }}>
        <div className="container">{franjaInferior}</div>
      </footer>
    );
  }

  return (
    <footer className="footer-tech">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h6>
              <span className="brand-mark">&lt;/&gt;</span> Knows-IS
            </h6>
            <p className="small mb-0">
              Cursos online de programación, redes y diseño digital, pensados para aprender a tu
              ritmo.
            </p>
          </div>
          <div className="col-lg-2 col-6">
            <h6>Sitio</h6>
            <ul className="list-unstyled small">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/cursos">Cursos</Link></li>
              <li><Link to="/nosotros">Nosotros</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-6">
            <h6>Cuenta</h6>
            <ul className="list-unstyled small">
              <li><Link to="/login">Iniciar sesión</Link></li>
              <li><Link to="/registro">Registrarse</Link></li>
            </ul>
          </div>
          <div className="col-lg-4">
            <h6>Contacto</h6>
            <ul className="list-unstyled small">
              <li>contacto@techacademy.cl</li>
              <li>Santiago, Chile</li>
            </ul>
          </div>
        </div>
        {franjaInferior}
      </div>
    </footer>
  );
}
