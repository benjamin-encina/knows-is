import PaginaPendiente from "../../components/PaginaPendiente";

export default function AdminCursoForm() {
  return (
    <PaginaPendiente
      titulo="Nuevo / editar curso"
      archivoOrigen="admin-curso-form.html + validaciones.js"
      seccion="5. Admin: cursos"
      admin
    />
  );
}
