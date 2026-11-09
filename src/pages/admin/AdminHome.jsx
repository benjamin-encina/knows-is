import { useEffect } from "react";
import { Link } from "react-router-dom";
import AdminTopbar from "../../components/AdminTopbar";
import { useCursos } from "../../context/CursosContext";
import { useUsuarios } from "../../context/UsuarioContext";
import { categorias, cupoEnAlerta } from "../../data/cursos";
import { roles } from "../../data/usuarios";

// Dashboard: todo se calcula con los mismos datos de los listados,
// así que se actualiza solo cuando se crea, edita o elimina algo.
export default function AdminHome() {
  const { cursos } = useCursos();
  const { usuarios, sincronizar } = useUsuarios();

  // trae a los que se registraron desde /registro
  useEffect(() => {
    sincronizar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enAlerta = cursos.filter(cupoEnAlerta);
  const cuposTotales = cursos.reduce((suma, c) => suma + c.cupos, 0);
  const activos = usuarios.filter((u) => u.estado === "Activo").length;

  const tarjetas = [
    { icono: "bi-mortarboard", valor: cursos.length, etiqueta: "Cursos", enlace: "/admin/cursos" },
    { icono: "bi-people", valor: usuarios.length, etiqueta: `Usuarios (${activos} activos)`, enlace: "/admin/usuarios" },
    { icono: "bi-ticket-perforated", valor: cuposTotales, etiqueta: "Cupos disponibles", enlace: "/admin/cursos" },
    { icono: "bi-exclamation-triangle", valor: enAlerta.length, etiqueta: "Cursos con cupo crítico", enlace: "/admin/cursos", alerta: enAlerta.length > 0 },
  ];

  const porRol = roles.map((rol) => ({ nombre: rol, total: usuarios.filter((u) => u.rol === rol).length }));

  const porCategoria = categorias
    .map((c) => ({ nombre: c.nombre, total: cursos.filter((x) => x.categoria === c.slug).length }))
    .filter((c) => c.total > 0);
  const maxCategoria = Math.max(1, ...porCategoria.map((c) => c.total));

  const recientes = [...usuarios].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <>
      <AdminTopbar titulo="Dashboard" />

      <div className="admin-content">
        {/* Tarjetas de resumen */}
        <div className="row g-3 mb-4">
          {tarjetas.map((t) => (
            <div className="col-sm-6 col-xl-3" key={t.etiqueta}>
              <Link to={t.enlace} className="admin-card d-flex align-items-center gap-3 p-3 text-decoration-none h-100">
                <i className={`bi ${t.icono} fs-3`} style={{ color: t.alerta ? "#e24b4a" : "var(--accent)" }}></i>
                <div>
                  <div className="h3 mb-0" style={{ color: "var(--ink)" }}>{t.valor}</div>
                  <div className="small text-muted">{t.etiqueta}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="row g-3">
          {/* Cursos por categoría */}
          <div className="col-lg-6">
            <div className="admin-card p-3 h-100">
              <h2 className="h6 mb-3">Cursos por categoría</h2>
              {porCategoria.length === 0 && <p className="text-muted small mb-0">Aún no hay cursos.</p>}
              {porCategoria.map((c) => (
                <div key={c.nombre} className="mb-2">
                  <div className="d-flex justify-content-between small">
                    <span>{c.nombre}</span>
                    <span className="text-muted">{c.total}</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar"
                      style={{ width: `${(c.total / maxCategoria) * 100}%`, backgroundColor: "var(--accent)" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usuarios por rol */}
          <div className="col-lg-6">
            <div className="admin-card p-3 h-100">
              <h2 className="h6 mb-3">Usuarios por rol</h2>
              <div className="d-flex gap-2 flex-wrap">
                {porRol.map((r) => (
                  <div key={r.nombre} className="flex-fill text-center p-3 rounded" style={{ background: "var(--paper-alt)" }}>
                    <div className="h4 mb-1">{r.total}</div>
                    <span className={`role-badge role-${r.nombre.toLowerCase()}`}>{r.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cupos críticos */}
          <div className="col-lg-6">
            <div className="admin-card h-100">
              <div className="p-3 pb-2 d-flex justify-content-between align-items-center">
                <h2 className="h6 mb-0">Cupos críticos</h2>
                <Link to="/admin/cursos" className="link-tech small">Ver cursos</Link>
              </div>
              {enAlerta.length === 0 ? (
                <p className="text-muted small px-3 pb-3 mb-0">Ningún curso está en cupo crítico.</p>
              ) : (
                <table className="admin-table">
                  <tbody>
                    {enAlerta.map((c) => (
                      <tr key={c.id}>
                        <td>{c.nombre}</td>
                        <td className="text-end text-nowrap">
                          <span className="status-dot status-warn"></span>
                          {c.cupos} {c.cupos === 1 ? "cupo" : "cupos"}
                        </td>
                        <td className="text-end">
                          <Link to={`/admin/cursos/${c.id}/editar`} className="link-tech">Editar</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Últimos usuarios */}
          <div className="col-lg-6">
            <div className="admin-card h-100">
              <div className="p-3 pb-2 d-flex justify-content-between align-items-center">
                <h2 className="h6 mb-0">Últimos usuarios</h2>
                <Link to="/admin/usuarios" className="link-tech small">Ver usuarios</Link>
              </div>
              <table className="admin-table">
                <tbody>
                  {recientes.map((u) => (
                    <tr key={u.id}>
                      <td>
                        {u.nombre}
                        <div className="small text-muted">{u.correo}</div>
                      </td>
                      <td className="text-end">
                        <span className={`role-badge role-${u.rol.toLowerCase()}`}>{u.rol}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}