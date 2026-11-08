import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminTopbar from "../../components/AdminTopbar";
import ResumenCupos from "../../components/ResumenCupos";
import { useCompras } from "../../context/ComprasContext";
import { useCursos } from "../../context/CursosContext";
import { cupoEnAlerta, nombreCategoria } from "../../data/cursos";
import { formatearPrecio } from "../../utils/formato";

export default function AdminCursos() {
  const { cursos, eliminarCurso } = useCursos();
  const { ocupadosDe } = useCompras();
  const location = useLocation();
  const [porEliminar, setPorEliminar] = useState(null); // curso que se está por borrar
  const [mensaje, setMensaje] = useState(location.state?.mensaje || "");

  const confirmarEliminar = () => {
    eliminarCurso(porEliminar.id);
    setMensaje(`Curso "${porEliminar.nombre}" eliminado.`);
    setPorEliminar(null);
  };

  return (
    <>
      <AdminTopbar titulo="Cursos">
        <Link to="/admin/cursos/nuevo" className="btn btn-tech-primary btn-sm">
          <i className="bi bi-plus-lg me-1"></i> Nuevo curso
        </Link>
      </AdminTopbar>

      <div className="admin-content">
        {mensaje && (
          <div className="alert alert-success d-flex justify-content-between align-items-center" role="alert">
            <span><i className="bi bi-check-circle me-1"></i> {mensaje}</span>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setMensaje("")}></button>
          </div>
        )}
        <ResumenCupos />

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Curso</th>
                <th>Categoría</th>
                <th>Nivel</th>
                <th>Precio</th>
                <th>Cupos (ocupados / total)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cursos.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4">No hay cursos. Crea el primero con "Nuevo curso".</td></tr>
              )}
              {cursos.map((curso) => {
                const alerta = cupoEnAlerta(curso, ocupadosDe(curso.id));
                return (
                  <tr key={curso.id}>
                    <td className="text-muted">{curso.codigo}</td>
                    <td>{curso.nombre}</td>
                    <td className="text-muted">{nombreCategoria(curso.categoria)}</td>
                    <td className="text-muted">{curso.nivel}</td>
                    <td>{formatearPrecio(curso.precio)}</td>
                    <td title={alerta ? "Cupo crítico: quedan pocos cupos" : ""}>
                      <span className={`status-dot ${alerta ? "status-warn" : "status-ok"}`}></span>
                      {ocupadosDe(curso.id)} / {curso.cupos}
                      {alerta && <span className="small text-danger ms-2">crítico</span>}
                    </td>
                    <td className="text-end text-nowrap">
                      <Link to={`/admin/cursos/${curso.id}/editar`} className="link-tech me-3">Editar</Link>
                      <button type="button" className="btn btn-link p-0 text-danger small"
                        onClick={() => setPorEliminar(curso)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {porEliminar && (
        <>
          <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Eliminar curso</h5>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setPorEliminar(null)}></button>
                </div>
                <div className="modal-body">
                  ¿Seguro que quieres eliminar <strong>{porEliminar.nombre}</strong>? Esta acción no se puede deshacer.
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-tech-outline" onClick={() => setPorEliminar(null)}>Cancelar</button>
                  <button type="button" className="btn btn-danger" onClick={confirmarEliminar}>Sí, eliminar</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </>
  );
}