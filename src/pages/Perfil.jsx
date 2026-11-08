import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCompras } from "../context/ComprasContext";
import { useCursos } from "../context/CursosContext";
import { nombreCategoria } from "../data/cursos";
import { formatearPrecio } from "../utils/formato";
import { describirOrden } from "../utils/pagos";

const formatearFecha = (iso) => new Date(iso).toLocaleDateString("es-CL", { dateStyle: "medium" });

// "Benjamín Encina" -> "BE"
const iniciales = (nombre) =>
  nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

// Mi Perfil: reúne en un solo lugar lo que antes eran "Mis cursos" y "Panel admin".
// Todos ven sus datos, sus cursos y su historial; solo el rol Admin ve el acceso al panel.
// (La ruta está protegida con RutaUsuario, por eso aquí siempre hay un usuario.)
export default function Perfil() {
  const { usuario, esAdmin } = useAuth();
  const { ordenesUsuario } = useCompras();
  const { obtenerCurso } = useCursos();

  const adquiridos = ordenesUsuario.flatMap((orden) =>
    orden.items.map((item) => ({ ...item, fecha: orden.fecha, ordenId: orden.id }))
  );

  const direccion = [usuario.direccion, usuario.comuna, usuario.region].filter(Boolean).join(", ");
  // solo se muestran los datos que el usuario realmente tiene
  const datos = [
    ["Correo", usuario.correo],
    ["Teléfono", usuario.telefono],
    ["RUT", usuario.rut],
    ["Dirección", direccion],
  ].filter(([, valor]) => valor);

  return (
    <section className="section-tight">
      <div className="container">
        <div className="perfil-cabecera">
          <div className="perfil-avatar" aria-hidden="true">{iniciales(usuario.nombre)}</div>
          <div>
            <h1>{usuario.nombre}</h1>
            <div className="perfil-correo">{usuario.correo}</div>
            <span className={`role-badge role-${usuario.rol.toLowerCase()}`}>{usuario.rol}</span>
          </div>
        </div>

        {esAdmin && (
          <div className="perfil-admin">
            <div>
              <h2>Panel de administración</h2>
              <p>Gestiona cursos, usuarios y órdenes de compra.</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/admin" className="btn btn-light btn-sm">
                <i className="bi bi-speedometer2 me-1"></i> Ir al panel
              </Link>
              <Link to="/admin/cursos" className="btn btn-outline-light btn-sm">Cursos</Link>
              <Link to="/admin/usuarios" className="btn btn-outline-light btn-sm">Usuarios</Link>
              <Link to="/admin/ordenes" className="btn btn-outline-light btn-sm">Órdenes</Link>
            </div>
          </div>
        )}

        <div className="row g-4 perfil-seccion">
          <div className="col-lg-4">
            <h2 className="h5 mb-3">Mis datos</h2>
            <div className="admin-card p-4">
              <dl className="perfil-datos">
                {datos.map(([etiqueta, valor]) => (
                  <div key={etiqueta}>
                    <dt>{etiqueta}</dt>
                    <dd>{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="col-lg-8">
            <h2 className="h5 mb-3">Mis cursos</h2>
            {adquiridos.length === 0 ? (
              <div className="admin-card p-4 text-center">
                <i className="bi bi-mortarboard display-5 text-muted"></i>
                <p className="fw-semibold mt-2 mb-1">Aún no tienes cursos</p>
                <p className="text-muted small">Cuando adquieras un curso, aparecerá aquí.</p>
                <Link to="/cursos" className="btn btn-tech-primary btn-sm">Ver cursos</Link>
              </div>
            ) : (
              <div className="row g-3">
                {adquiridos.map((item) => (
                  <div className="col-md-6" key={`${item.ordenId}-${item.cursoId}`}>
                    <div className="admin-card p-4 h-100">
                      <span className="badge-tech">Inscrito</span>
                      <div className="mt-3">
                        <span className="course-tag">{nombreCategoria(item.categoria)}</span>
                      </div>
                      <h3 className="h6 mt-1">{item.nombre}</h3>
                      <p className="text-muted small mb-1">Instructor: {item.instructor}</p>
                      <p className="text-muted small mb-3">Adquirido el {formatearFecha(item.fecha)}</p>
                      {obtenerCurso(item.cursoId) && (
                        <Link to={`/cursos/${item.cursoId}`} className="link-tech small">Ver detalle del curso →</Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="perfil-seccion">
          <h2 className="h5 mb-3">Historial de compras</h2>
          {ordenesUsuario.length === 0 ? (
            <div className="admin-card p-4 text-muted">Aún no registras compras.</div>
          ) : (
            <div className="admin-card">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="text-nowrap">N° orden</th>
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
                        <td className="text-nowrap">{orden.id}</td>
                        <td className="text-nowrap">{formatearFecha(orden.fecha)}</td>
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
          )}
        </div>
      </div>
    </section>
  );
}
