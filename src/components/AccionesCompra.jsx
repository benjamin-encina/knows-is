import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useCompras } from "../context/ComprasContext";

// Botones de compra del panel derecho en CursoDetalle.
// Cubre los 4 estados: ya inscrito, sin cupos, ya en el carrito, y disponible.
export default function AccionesCompra({ curso }) {
  const navigate = useNavigate();
  const { agregar, estaEnCarrito } = useCarrito();
  const { yaAdquirido, disponiblesDe } = useCompras();

  if (yaAdquirido(curso.id)) {
    return (
      <>
        <div className="alert alert-success small py-2" role="status">
          <i className="bi bi-check-circle me-1"></i> Ya estás inscrito en este curso.
        </div>
        <Link to="/perfil" className="btn btn-tech-primary w-100 mb-2">Ir a Mi Perfil</Link>
      </>
    );
  }

  if (disponiblesDe(curso) <= 0) {
    return (
      <button type="button" className="btn btn-tech-primary w-100 mb-2" disabled>
        Sin cupos disponibles
      </button>
    );
  }

  const comprarAhora = () => {
    agregar(curso.id);
    navigate("/checkout"); // si no hay sesión, RutaUsuario manda al login y luego vuelve aquí
  };

  return (
    <>
      <button type="button" className="btn btn-tech-primary w-100 mb-2" onClick={comprarAhora}>
        Comprar ahora
      </button>
      {estaEnCarrito(curso.id) ? (
        <Link to="/carrito" className="btn btn-tech-outline w-100 mb-2">
          <i className="bi bi-cart-check me-1"></i> En tu carrito · Ver carrito
        </Link>
      ) : (
        <button type="button" className="btn btn-tech-outline w-100 mb-2" onClick={() => agregar(curso.id)}>
          <i className="bi bi-cart-plus me-1"></i> Agregar al carrito
        </button>
      )}
    </>
  );
}
