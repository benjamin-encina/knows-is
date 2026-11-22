import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AdminTopbar from "../../components/AdminTopbar";
import { useUsuarios } from "../../context/UsuarioContext";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsuarios() {
  const { usuarios, cargando, error, recargar, eliminarUsuario } = useUsuarios();
  const { usuario: sesion } = useAuth();
  const location = useLocation();
  const [porEliminar, setPorEliminar] = useState(null);
  const [mensaje, setMensaje] = useState(location.state?.mensaje || "");
  const [errorEliminar, setErrorEliminar] = useState("");

  // al abrir la pantalla se pide la lista actualizada al backend
  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const esMiCuenta = (u) => sesion && String(u.id) === String(sesion.id);

  const confirmarEliminar = async () => {
    try {
      await eliminarUsuario(porEliminar.id);
      setMensaje(`Usuario "${porEliminar.nombreCompleto}" eliminado.`);
    } catch (e) {
      setErrorEliminar(e.message); // por ejemplo: no puedes eliminar tu propia cuenta
    }
    setPorEliminar(null);
  };

  return (
    <>
      <AdminTopbar titulo="Usuarios">
        <Link to="/admin/usuarios/nuevo" className="btn btn-tech-primary btn-sm">
          <i className="bi bi-plus-lg me-1"></i> Nuevo usuario
        </Link>
      </AdminTopbar>

      <div className="admin-content">
        {(error || errorEliminar) && (
          <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
            <span>{error || errorEliminar}</span>
            {errorEliminar && (
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setErrorEliminar("")}></button>
            )}
          </div>
        )}

        {mensaje && (
          <div className="alert alert-success d-flex justify-content-between align-items-center" role="alert">
            <span><i className="bi bi-check-circle me-1"></i> {mensaje}</span>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setMensaje("")}></button>
          </div>
        )}

        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">Cargando usuarios…</td>
                </tr>
              )}
              {!cargando && usuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No hay usuarios. Crea el primero con "Nuevo usuario".
                  </td>
                </tr>
              )}
              {usuarios.map((u) => {
                const activo = u.estado === "Activo";
                return (
                  <tr key={u.id}>
                    <td>
                      {u.nombreCompleto}
                      {esMiCuenta(u) && <span className="small text-muted ms-2">(tú)</span>}
                    </td>
                    <td className="text-muted">{u.correo}</td>
                    <td><span className={`role-badge role-${u.rol.toLowerCase()}`}>{u.rol}</span></td>
                    <td>
                      <span className={`status-dot ${activo ? "status-ok" : "status-warn"}`}></span>
                      {u.estado}
                    </td>
                    <td className="text-end text-nowrap">
                      <Link to={`/admin/usuarios/${u.id}/editar`} className="link-tech me-3">Editar</Link>
                      <button
                        type="button"
                        className="btn btn-link p-0 text-danger small"
                        disabled={esMiCuenta(u)}
                        title={esMiCuenta(u) ? "No puedes eliminar tu propia cuenta." : ""}
                        onClick={() => setPorEliminar(u)}
                      >
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
                  <h5 className="modal-title">Eliminar usuario</h5>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setPorEliminar(null)}></button>
                </div>
                <div className="modal-body">
                  ¿Seguro que quieres eliminar a <strong>{porEliminar.nombreCompleto}</strong>? Esta acción no se puede deshacer.
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