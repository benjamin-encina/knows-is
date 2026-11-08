import { Link, useParams } from "react-router-dom";
import { cupoEnAlerta, nombreCategoria } from "../data/cursos";
import { useCursos } from "../context/CursosContext";
import { formatearPrecio } from "../utils/formato";
import AccionesCompra from "../components/AccionesCompra";
import { useCompras } from "../context/ComprasContext";

export default function CursoDetalle() {
  const { id } = useParams();
  const { obtenerCurso } = useCursos();
  const { ocupadosDe, disponiblesDe } = useCompras();
  const curso = obtenerCurso(id);

  if (!curso) {
    return (
      <section className="section">
        <div className="container text-center">
          <h1 className="h3">Curso no encontrado</h1>
          <Link to="/cursos" className="btn btn-tech-outline mt-3">Volver al catálogo</Link>
        </div>
      </section>
    );
  }

  const categoria = nombreCategoria(curso.categoria);
  const disponibles = disponiblesDe(curso);

  return (
    <section className="section" style={{ paddingTop: "3rem" }}>
      <div className="container">
        <nav className="breadcrumb-tech">
          <Link to="/">Home</Link> › <Link to="/cursos">Cursos</Link> ›{" "}
          <Link to={`/cursos?categoria=${curso.categoria}`}>{categoria}</Link> › {curso.nombre}
        </nav>

        <div className="row g-5">
          <div className="col-lg-7">
            <div className="course-icon-panel"
              style={{ borderRadius: 14, aspectRatio: "16/10", backgroundImage: `url('${curso.imagen}')` }}>
              <i className={`bi ${curso.icono}`}></i>
            </div>

            <h2 className="h5 mt-5 mb-3">Sobre este curso</h2>
            <p className="text-muted">{curso.descripcion}</p>

            {/* Solo si el curso trae "contenidos" en data/cursos.js: [{ titulo, semanas }] */}
            {curso.contenidos?.length > 0 && (
              <>
                <h2 className="h5 mt-5 mb-3">Contenidos</h2>
                <div className="admin-card">
                  {curso.contenidos.map((m, i) => (
                    <div key={m.titulo}
                      className={`d-flex justify-content-between align-items-center p-3 ${i < curso.contenidos.length - 1 ? "border-bottom" : ""}`}
                      style={{ borderColor: "var(--line)" }}>
                      <span><strong>{i + 1}.</strong> {m.titulo}</span>
                      <span className="text-muted small">{m.semanas} semanas</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="col-lg-5">
            <div className="admin-card p-4" style={{ position: "sticky", top: "1.5rem" }}>
              <span className="course-tag">{categoria} · {curso.nivel}</span>
              <h1 className="h3 mt-2 mb-3">{curso.nombre}</h1>
              <div className="d-flex align-items-baseline gap-2 mb-4">
                <span className="course-price fs-3">{formatearPrecio(curso.precio)}</span>
                <span className="text-muted small">pago único o hasta 6 cuotas</span>
              </div>
              {curso.duracion && (
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Duración</span><span>{curso.duracion} semanas</span>
                </div>
              )}
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Instructor</span><span>{curso.instructor}</span>
              </div>
              <div className="d-flex justify-content-between small mb-4">
                <span className="text-muted">Cupos disponibles</span>
                <span>{disponibles} de {curso.cupos}{cupoEnAlerta(curso, ocupadosDe(curso.id)) && <span className="badge-tech ms-2">¡Últimos cupos!</span>}</span>
              </div>

              <AccionesCompra curso={curso} />
              <Link to="/cursos" className="btn btn-tech-outline w-100">Volver al catálogo</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}