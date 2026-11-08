import { Link, useNavigate, useParams } from "react-router-dom";
import AdminTopbar from "../../components/AdminTopbar";
import Campo from "../../components/Campo";
import useFormulario from "../../hooks/useFormulario";
import { useUsuarios } from "../../context/UsuarioContext";
import { roles } from "../../data/usuarios";
import { validarTextoObligatorio, validarCorreo, validarTelefono } from "../../utils/validaciones";
import {
  validarPasswordUsuario, validarRol, validarEstado, validarCorreoUnico,
} from "../../utils/validacionesUsuario";

const estados = ["Activo", "Inactivo"];
const vacio = { nombre: "", correo: "", telefono: "", contrasena: "", rol: "", estado: "Activo" };

// Un solo formulario para "Nuevo usuario" y "Editar usuario" (si hay :id en la URL se precarga)
export default function AdminUsuarioForm() {
  const { id } = useParams();
  // key: al pasar de "nuevo" a "editar" el formulario se reinicia
  return <FormularioUsuario key={id || "nuevo"} id={id} />;
}

function FormularioUsuario({ id }) {
  const navigate = useNavigate();
  const { usuarios, obtenerUsuario, crearUsuario, editarUsuario } = useUsuarios();
  const usuario = id ? obtenerUsuario(id) : null;

  const inicial = usuario
    ? {
        ...vacio,
        nombre: usuario.nombre,
        correo: usuario.correo,
        telefono: usuario.telefono || "",
        rol: usuario.rol,
        estado: usuario.estado || "Activo",
      }
    : vacio;

  const validar = (v) => ({
    nombre: validarTextoObligatorio(v.nombre, "El nombre", 100),
    correo: validarCorreo(v.correo) || validarCorreoUnico(v.correo, usuarios, id),
    telefono: validarTelefono(v.telefono),
    contrasena: validarPasswordUsuario(v.contrasena, { obligatoria: !usuario }),
    rol: validarRol(v.rol),
    estado: validarEstado(v.estado),
  });

  const f = useFormulario(inicial, validar);

  if (id && !usuario) {
    return (
      <>
        <AdminTopbar titulo="Editar usuario" />
        <div className="admin-content">
          <div className="alert alert-warning" style={{ maxWidth: 760 }}>
            No encontramos ese usuario. <Link to="/admin/usuarios">Volver al listado</Link>
          </div>
        </div>
      </>
    );
  }

  const alGuardar = (v) => {
    const datos = {
      nombre: v.nombre.trim(),
      correo: v.correo.trim(),
      telefono: v.telefono.trim(),
      rol: v.rol,
      estado: v.estado,
    };
    // al editar, contraseña vacía = conservar la actual
    if (v.contrasena !== "") datos.contrasena = v.contrasena;

    if (usuario) editarUsuario(usuario.id, datos);
    else crearUsuario(datos);

    navigate("/admin/usuarios", {
      state: { mensaje: usuario ? "Usuario actualizado correctamente." : "Usuario creado correctamente." },
    });
  };

  const p = (campo) => ({
    id: campo, value: f.valores[campo], onChange: f.cambiar, onBlur: f.salir, error: f.errorDe(campo),
  });

  return (
    <>
      <AdminTopbar titulo={usuario ? "Editar usuario" : "Nuevo usuario"} />
      <div className="admin-content">
        <form className="form-tech admin-card p-4" style={{ maxWidth: 760 }} noValidate onSubmit={f.enviar(alGuardar)}>
          <div className="row">
            <div className="col-md-6">
              <Campo label="Nombre completo" maxLength={100} required {...p("nombre")} />
            </div>
            <div className="col-md-6">
              <Campo label="Correo" type="email" maxLength={100} required {...p("correo")} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <Campo label={<>Teléfono <span className="text-muted">(opcional)</span></>} type="tel" maxLength={20} {...p("telefono")} />
            </div>
            <div className="col-md-6">
              <Campo
                label={usuario ? <>Contraseña <span className="text-muted">(opcional)</span></> : "Contraseña"}
                type="password" maxLength={10} autoComplete="new-password" required={!usuario}
                hint={usuario
                  ? "Déjala vacía para conservar la actual."
                  : "8 a 10 caracteres, con mayúscula, minúscula, número y un especial (# - $ & % ! * @)."}
                {...p("contrasena")}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <Campo label="Rol" as="select" required {...p("rol")}>
                <option disabled value="">Seleccione un rol</option>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </Campo>
            </div>
            <div className="col-md-6">
              <Campo label="Estado" as="select" required {...p("estado")}>
                {estados.map((e) => <option key={e} value={e}>{e}</option>)}
              </Campo>
            </div>
          </div>
          <div className="d-flex gap-2 mt-2">
            <button type="submit" className="btn btn-tech-primary">Guardar usuario</button>
            <Link to="/admin/usuarios" className="btn btn-tech-outline">Cancelar</Link>
          </div>
        </form>
      </div>
    </>
  );
}