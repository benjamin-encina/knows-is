import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminTopbar from "../../components/AdminTopbar";
import Campo from "../../components/Campo";
import useFormulario from "../../hooks/useFormulario";
import { useCursos } from "../../context/CursosContext";
import { categorias, niveles, instructores } from "../../data/cursos";
import { validarSeleccion } from "../../utils/validaciones";
import {
  validarCodigo, validarNombre, validarDescripcion, validarPrecio,
  validarCupos, validarCupoCritico, validarImagen,
} from "../../utils/validacionesCurso";

const vacio = {
  codigo: "", nombre: "", descripcion: "", precio: "", cupos: "", cupoCritico: "",
  categoria: "", nivel: "", instructor: "", imagen: "",
};

// Un solo formulario para "Nuevo curso" y "Editar curso" (si hay :id en la URL se precarga).
export default function AdminCursoForm() {
  const { id } = useParams();
  // key: al pasar de "nuevo" a "editar" (o entre cursos) el formulario se reinicia
  return <FormularioCurso key={id || "nuevo"} id={id} />;
}

function FormularioCurso({ id }) {
  const navigate = useNavigate();
  const { cursos, obtenerCurso, crearCurso, editarCurso } = useCursos();
  const curso = id ? obtenerCurso(id) : null;
  const [archivo, setArchivo] = useState(null);

  const inicial = curso
    ? {
        ...vacio,
        codigo: curso.codigo, nombre: curso.nombre, descripcion: curso.descripcion || "",
        precio: String(curso.precio), cupos: String(curso.cupos),
        cupoCritico: curso.cupoCritico == null ? "" : String(curso.cupoCritico),
        categoria: curso.categoria, nivel: curso.nivel, instructor: curso.instructor,
      }
    : vacio;

  const validar = (v) => ({
    codigo:
      validarCodigo(v.codigo) ||
      (cursos.some((c) => c.codigo === v.codigo.trim() && String(c.id) !== String(id))
        ? "Ya existe un curso con ese código."
        : ""),
    nombre: validarNombre(v.nombre),
    descripcion: validarDescripcion(v.descripcion),
    precio: validarPrecio(v.precio),
    cupos: validarCupos(v.cupos),
    cupoCritico: validarCupoCritico(v.cupoCritico, v.cupos),
    categoria: validarSeleccion(v.categoria, "una categoría"),
    nivel: validarSeleccion(v.nivel, "un nivel"),
    instructor: validarSeleccion(v.instructor, "un instructor"),
    imagen: validarImagen(archivo),
  });

  const f = useFormulario(inicial, validar);

  if (id && !curso) {
    return (
      <>
        <AdminTopbar titulo="Editar curso" />
        <div className="admin-content">
          <div className="alert alert-warning" style={{ maxWidth: 760 }}>
            No encontramos ese curso. <Link to="/admin/cursos">Volver al listado</Link>
          </div>
        </div>
      </>
    );
  }

  const alGuardar = (v) => {
    const datos = {
      codigo: v.codigo.trim(),
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim(),
      precio: Number(v.precio),
      cupos: Number(v.cupos),
      cupoCritico: v.cupoCritico.trim() === "" ? null : Number(v.cupoCritico),
      categoria: v.categoria,
      nivel: v.nivel,
      instructor: v.instructor,
    };
    if (archivo) datos.imagen = URL.createObjectURL(archivo); // vista previa en memoria (sin backend)
    if (curso) editarCurso(curso.id, datos);
    else crearCurso(datos);
    navigate("/admin/cursos", {
      state: { mensaje: curso ? "Curso actualizado correctamente." : "Curso creado correctamente." },
    });
  };

  const p = (campo) => ({
    id: campo, value: f.valores[campo], onChange: f.cambiar, onBlur: f.salir, error: f.errorDe(campo),
  });
  // si cambian los cupos, el cupo crítico se revalida solo (validar lee ambos valores)
  const cambiarImagen = (e) => {
    setArchivo(e.target.files[0] || null);
    f.cambiar(e);
  };

  return (
    <>
      <AdminTopbar titulo={curso ? "Editar curso" : "Nuevo curso"} />
      <div className="admin-content">
        <form className="form-tech admin-card p-4" style={{ maxWidth: 760 }} noValidate onSubmit={f.enviar(alGuardar)}>
          <div className="row">
            <div className="col-md-4"><Campo label="Código del curso" {...p("codigo")} /></div>
            <div className="col-md-8"><Campo label="Nombre" maxLength={100} {...p("nombre")} /></div>
          </div>
          <Campo label={<>Descripción <span className="text-muted">(opcional)</span></>} as="textarea" rows={4} maxLength={500}
            hint={`${f.valores.descripcion.length}/500 caracteres.`} {...p("descripcion")} />
          <div className="row">
            <div className="col-md-4">
              <Campo label="Precio ($)" type="number" min="0" step="1000" hint="0 se considera curso gratuito." {...p("precio")} />
            </div>
            <div className="col-md-4"><Campo label="Cupos" type="number" min="0" step="1" {...p("cupos")} /></div>
            <div className="col-md-4">
              <Campo label={<>Cupo crítico <span className="text-muted">(opcional)</span></>} type="number" min="0" step="1" {...p("cupoCritico")} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <Campo label="Categoría" as="select" {...p("categoria")}>
                <option disabled value="">Seleccione una categoría</option>
                {categorias.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
              </Campo>
            </div>
            <div className="col-md-6">
              <Campo label="Nivel" as="select" {...p("nivel")}>
                <option disabled value="">Seleccione un nivel</option>
                {niveles.map((n) => <option key={n} value={n}>{n}</option>)}
              </Campo>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <Campo label="Instructor" as="select" {...p("instructor")}>
                <option disabled value="">Seleccione un instructor</option>
                {instructores.map((i) => <option key={i} value={i}>{i}</option>)}
              </Campo>
            </div>
            <div className="col-md-6">
              <Campo label={<>Imagen <span className="text-muted">(opcional)</span></>} type="file" accept="image/*"
                {...p("imagen")} value={undefined} onChange={cambiarImagen} />
            </div>
          </div>
          <div className="d-flex gap-2 mt-2">
            <button type="submit" className="btn btn-tech-primary">Guardar curso</button>
            <Link to="/admin/cursos" className="btn btn-tech-outline">Cancelar</Link>
          </div>
        </form>
      </div>
    </>
  );
}