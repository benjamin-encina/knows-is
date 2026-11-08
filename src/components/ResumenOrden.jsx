import { formatearPrecio } from "../utils/formato";

// Tarjeta lateral con los cursos y el total. Se usa en el carrito y en el checkout.
// children = botones o texto extra que va debajo del total.
// descuento (opcional): si es mayor que 0 se muestran el subtotal y el descuento antes del total.
export default function ResumenOrden({ items, total, descuento = 0, titulo = "Resumen", children }) {
  return (
    <div className="admin-card p-4" style={{ position: "sticky", top: "1.5rem" }}>
      <h2 className="h5 mb-3">{titulo}</h2>
      {items.map((curso) => (
        <div key={curso.id} className="d-flex justify-content-between gap-3 small mb-2">
          <span>{curso.nombre}</span>
          <span className="text-nowrap">{formatearPrecio(curso.precio)}</span>
        </div>
      ))}
      <hr />
      {descuento > 0 && (
        <>
          <div className="d-flex justify-content-between small mb-1">
            <span className="text-muted">Subtotal</span>
            <span>{formatearPrecio(total + descuento)}</span>
          </div>
          <div className="d-flex justify-content-between small mb-2">
            <span className="text-muted">Descuento 1ª cuota</span>
            <span className="text-success">−{formatearPrecio(descuento)}</span>
          </div>
        </>
      )}
      <div className="d-flex justify-content-between align-items-baseline mb-3">
        <strong>Total</strong>
        <span className="course-price fs-4">{formatearPrecio(total)}</span>
      </div>
      {children}
    </div>
  );
}
