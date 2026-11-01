import { Link } from "react-router-dom";
import { nombreCategoria } from "../data/cursos";
import { formatearPrecio } from "../utils/formato";

// Tarjeta de curso del sitio público (home y catálogo).
// Uso: <CourseCard curso={curso} />  (el objeto viene de data/cursos.js)
export default function CourseCard({ curso }) {
  return (
    <Link to={`/cursos/${curso.id}`} className="course-card d-block text-reset text-decoration-none">
      <div
        className="course-icon-panel"
        style={{ backgroundImage: `url('${curso.imagen}')` }}
      >
        <i className={`bi ${curso.icono}`}></i>
        {curso.nuevo && <span className="badge-new">Nuevo</span>}
      </div>
      <div className="course-body">
        <span className="course-tag">{nombreCategoria(curso.categoria)}</span>
        <h3 className="h5 mt-1">{curso.nombre}</h3>
        <p className="text-muted small mb-2">{curso.descripcion}</p>
        <span className="course-price">{formatearPrecio(curso.precio)}</span>
      </div>
    </Link>
  );
}
