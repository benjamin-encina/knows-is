// Barra superior de las páginas del admin: título a la izquierda y,
// opcionalmente, un botón o enlace a la derecha (se pasa como children).
export default function AdminTopbar({ titulo, children }) {
  return (
    <div className="admin-topbar">
      <h1>{titulo}</h1>
      {children}
    </div>
  );
}
