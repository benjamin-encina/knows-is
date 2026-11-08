import { Link } from "react-router-dom";
import { useCompras } from "../context/ComprasContext";
import { useCursos } from "../context/CursosContext";
import { nombreCategoria } from "../data/cursos";
import { formatearPrecio } from "../utils/formato";
import { describirOrden } from "../utils/pagos";

const formatearFecha = (iso) => new Date(iso).toLocaleDateString("es-CL", { dateStyle: "medium" });

export default function MisCursos() {
  const { ordenesUsuario } = useCompras();
  const { obtenerCurso } = useCursos();

  // cursos adquiridos = los ítems de todas las órdenes del usuario
  const adquiridos = ordenesUsuario.flatMap((orden) =>
    orden.items.map((item) => ({ ...item, fecha: orden.fecha, ordenId: orden.id }))
  );

  if (ordenesUsuario.length === 0) {
    return (
      <section className="section">
        <div className="container text-center">
          <i className="bi bi-mortarboard display-4 text-muted"></i>
          <h1 className="h3 mt-3">Aún no tienes cursos</h1>
          <p className="text-muted">Cuando adquieras un curso, aparecerá aquí.</p>
          <Link to="/cursos" className="btn btn-tech-primary">Ver cursos</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: "3rem" }}>
      <div className="container">
        <h1 className="h3 mb-4">Mis cursos</h1>

        <div className="row g-4 mb-5">
          {adquiridos.map((item) => (
            <div className="col-md-6 col-lg-4" key={`${item.ordenId}-${item.cursoId}`}>
              <div className="admin-card p-4 h-100">
                <span className="badge-tech">Inscrito</span>
                <div className="mt-3">
                  <span className="course-tag">{nombreCategoria(item.categoria)}</span>
                </div>
                <h2 className="h5 mt-1">{item.nombre}</h2>
                <p className="text-muted small mb-1">Instructor: {item.instructor}</p>
                <p className="text-muted small mb-3">Adquirido el {formatearFecha(item.fecha)}</p>
                {obtenerCurso(item.cursoId) && (
                  <Link to={`/cursos/${item.cursoId}`} className="link-tech">Ver detalle del curso →</Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <h2 className="h5 mb-3">Historial de compras</h2>
        <div className="admin-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>N° orden</th>
                  <th>Fecha</th>
                  <th>Cursos</th>
                  <th>Total</th>
                  <th>Forma de pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ordenesUsuario.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.id}</td>
                    <td>{formatearFecha(orden.fecha)}</td>
                    <td>{orden.items.map((i) => i.nombre).join(", ")}</td>
                    <td>{formatearPrecio(orden.total)}</td>
                    <td>{describirOrden(orden)}</td>
                    <td>{orden.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
