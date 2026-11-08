import { Link, useParams } from "react-router-dom";
import { useCompras } from "../context/ComprasContext";
import { formatearPrecio } from "../utils/formato";
import { describirOrden } from "../utils/pagos";

export default function CompraExitosa() {
  const { id } = useParams();
  const { obtenerOrden } = useCompras();
  const orden = obtenerOrden(id);

  if (!orden) {
    return (
      <section className="section">
        <div className="container text-center">
          <h1 className="h3">Orden no encontrada</h1>
          <Link to="/perfil" className="btn btn-tech-outline mt-3">Ir a Mi Perfil</Link>
        </div>
      </section>
    );
  }

  const fecha = new Date(orden.fecha).toLocaleString("es-CL", { dateStyle: "long", timeStyle: "short" });

  return (
    <section className="section" style={{ paddingTop: "3rem" }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="text-center mb-4">
          <i className="bi bi-check-circle display-3 text-success"></i>
          <h1 className="h3 mt-2">¡Adquisición exitosa!</h1>
          <p className="text-muted mb-0">
            Ya estás inscrito. Tu número de orden es <strong>{orden.id}</strong>.
          </p>
        </div>

        <div className="admin-card p-4 mb-4">
          <h2 className="h5 mb-3">Detalle de la compra</h2>
          {orden.items.map((item) => (
            <div key={item.cursoId} className="d-flex justify-content-between gap-3 mb-2">
              <span>
                {item.nombre} <span className="text-muted small">· {item.instructor}</span>
              </span>
              <span className="text-nowrap">{formatearPrecio(item.precio)}</span>
            </div>
          ))}
          <hr />
          {orden.descuento > 0 && (
            <>
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Subtotal</span>
                <span>{formatearPrecio(orden.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Descuento 1ª cuota</span>
                <span className="text-success">−{formatearPrecio(orden.descuento)}</span>
              </div>
            </>
          )}
          <div className="d-flex justify-content-between align-items-baseline mb-3">
            <strong>Total a pagar</strong>
            <span className="course-price fs-4">{formatearPrecio(orden.total)}</span>
          </div>
          <div className="small text-muted">
            <div>Fecha: {fecha}</div>
            <div>Medio de pago: {orden.pago.medio}</div>
            <div>Forma de pago: {describirOrden(orden)}</div>
            <div>Referencia: {orden.pago.referencia}</div>
            <div>Facturado a: {orden.facturacion.nombre} ({orden.facturacion.correo})</div>
            {orden.facturacion.rut && <div>RUT: {orden.facturacion.rut}</div>}
            {orden.facturacion.direccion && <div>Dirección: {orden.facturacion.direccion}</div>}
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <Link to="/perfil" className="btn btn-tech-primary">Ir a Mi Perfil</Link>
          <Link to="/cursos" className="btn btn-tech-outline">Seguir explorando</Link>
        </div>
      </div>
    </section>
  );
}
