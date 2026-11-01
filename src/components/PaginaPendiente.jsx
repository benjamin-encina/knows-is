import AdminTopbar from "./AdminTopbar";

// Página provisoria para que todas las rutas existan desde el inicio (nada da 404).
// Quien migre la página real reemplaza el contenido del archivo y borra esta llamada.
//   titulo        -> nombre de la página
//   archivoOrigen -> archivo HTML de la iteración anterior que hay que migrar (o "nuevo")
//   seccion       -> sección de la lista de tareas a la que pertenece
//   admin         -> true si va dentro del layout del administrador
export default function PaginaPendiente({ titulo, archivoOrigen, seccion, admin = false, children }) {
  const contenido = (
    <div className="admin-card p-4" style={{ maxWidth: 760 }}>
      <span className="badge-tech">Pendiente · {seccion}</span>
      <h2 className="h4 mt-3">{titulo}</h2>
      <p className="text-muted mb-0">
        Origen: <code>{archivoOrigen}</code>
      </p>
      {children}
    </div>
  );

  if (admin) {
    return (
      <>
        <AdminTopbar titulo={titulo} />
        <div className="admin-content">{contenido}</div>
      </>
    );
  }

  return (
    <section className="section">
      <div className="container">{contenido}</div>
    </section>
  );
}
