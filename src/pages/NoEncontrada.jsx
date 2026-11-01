import { Link } from "react-router-dom";

// Se muestra para cualquier URL que no exista (404)
export default function NoEncontrada() {
  return (
    <section className="section">
      <div className="container text-center">
        <h1 className="display-5">404</h1>
        <p className="text-muted">La página que buscas no existe.</p>
        <Link to="/" className="btn btn-tech-primary">Volver al inicio</Link>
      </div>
    </section>
  );
}
