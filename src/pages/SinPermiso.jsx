import { Link } from "react-router-dom";

// Se muestra cuando hay sesión pero el rol no alcanza (por ejemplo, un alumno que abre /admin)
export default function SinPermiso() {
  return (
    <section className="section">
      <div className="container text-center">
        <h1 className="display-5">403</h1>
        <p className="text-muted">No tienes permiso para ver esta página.</p>
        <Link to="/" className="btn btn-tech-primary">Volver al inicio</Link>
      </div>
    </section>
  );
}