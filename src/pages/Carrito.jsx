import { Link, useNavigate } from "react-router-dom";
import ResumenOrden from "../components/ResumenOrden";
import { useCarrito } from "../context/CarritoContext";
import { useCompras } from "../context/ComprasContext";
import { nombreCategoria } from "../data/cursos";
import { formatearPrecio } from "../utils/formato";
import { DESCUENTO_PRIMERA_CUOTA } from "../utils/pagos";

export default function Carrito() {
  const navigate = useNavigate();
  const { items, total, quitar } = useCarrito();
  const { validarItem } = useCompras();

  const problemas = items.map((curso) => validarItem(curso));
  const hayProblemas = problemas.some(Boolean);

  if (items.length === 0) {
    return (
      <section className="section">
        <div className="container text-center">
          <i className="bi bi-cart3 display-4 text-muted"></i>
          <h1 className="h3 mt-3">Tu carrito está vacío</h1>
          <p className="text-muted">Explora el catálogo y agrega los cursos que te interesen.</p>
          <Link to="/cursos" className="btn btn-tech-primary">Ver cursos</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: "3rem" }}>
      <div className="container">
        <h1 className="h3 mb-4">Tu carrito</h1>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="admin-card">
              {items.map((curso, i) => (
                <div
                  key={curso.id}
                  className={`d-flex align-items-center gap-3 p-3 ${i < items.length - 1 ? "border-bottom" : ""}`}
                  style={{ borderColor: "var(--line)" }}
                >
                  <div
                    style={{
                      width: 96, height: 64, borderRadius: 8, flexShrink: 0,
                      backgroundImage: `url('${curso.imagen}')`, backgroundSize: "cover", backgroundPosition: "center",
                    }}
                  />
                  <div className="flex-grow-1">
                    <span className="course-tag">{nombreCategoria(curso.categoria)} · {curso.nivel}</span>
                    <div>
                      <Link to={`/cursos/${curso.id}`} className="fw-semibold text-reset text-decoration-none">
                        {curso.nombre}
                      </Link>
                    </div>
                    <div className="text-muted small">Instructor: {curso.instructor}</div>
                    {problemas[i] && <div className="text-danger small mt-1">{problemas[i]} Quítalo para continuar.</div>}
                  </div>
                  <div className="text-end">
                    <div className="course-price">{formatearPrecio(curso.precio)}</div>
                    <button type="button" className="btn btn-link btn-sm p-0 text-danger" onClick={() => quitar(curso.id)}>
                      <i className="bi bi-trash me-1"></i>Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/cursos" className="link-tech d-inline-block mt-3">← Seguir explorando</Link>
          </div>

          <div className="col-lg-4">
            <ResumenOrden items={items} total={total}>
              <button
                type="button"
                className="btn btn-tech-primary w-100"
                disabled={hayProblemas}
                onClick={() => navigate("/checkout")}
              >
                Continuar al pago
              </button>
              <p className="small text-center mt-2 mb-1" style={{ color: "var(--accent-2)" }}>
                <i className="bi bi-tag me-1"></i>
                Pagando en cuotas, tu primera cuota tiene {Math.round(DESCUENTO_PRIMERA_CUOTA * 100)}% de descuento.
              </p>
              <p className="text-muted small text-center mb-0">Necesitas iniciar sesión para pagar.</p>
            </ResumenOrden>
          </div>
        </div>
      </div>
    </section>
  );
}
