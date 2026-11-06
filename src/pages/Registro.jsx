import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Campo from "../components/Campo";
import useFormulario from "../hooks/useFormulario";
import { useAuth } from "../context/AuthContext";
import { regiones } from "../data/regiones";
import {
  validarTextoObligatorio, validarCorreo, validarPasswordRegistro,
  validarConfirmacion, validarTelefono, validarSeleccion,
} from "../utils/validaciones";

const inicial = {
  nombre: "", apellidos: "", correo: "", contrasena: "", confirmar: "",
  telefono: "", region: "", comuna: "", direccion: "",
};

const validar = (v) => ({
  nombre: validarTextoObligatorio(v.nombre, "El nombre", 50),
  apellidos: validarTextoObligatorio(v.apellidos, "Los apellidos", 100),
  correo: validarCorreo(v.correo),
  contrasena: validarPasswordRegistro(v.contrasena),
  confirmar: validarConfirmacion(v.contrasena, v.confirmar),
  telefono: validarTelefono(v.telefono),
  region: validarSeleccion(v.region, "una región"),
  comuna: validarSeleccion(v.comuna, "una comuna"),
  direccion: validarTextoObligatorio(v.direccion, "La dirección", 300),
});

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [errorGeneral, setErrorGeneral] = useState("");
  const f = useFormulario(inicial, validar);
  const comunas = regiones[f.valores.region] || [];

  // al cambiar la región se vacía la comuna (el select de comunas depende de la región)
  const cambiarRegion = (e) => {
    f.cambiar(e);
    f.setValores((v) => ({ ...v, region: e.target.value, comuna: "" }));
  };

  const alEnviar = ({ confirmar, ...datos }) => {
    // data/usuarios.js usa un solo campo "nombre": se guarda completo y también por separado
    const res = registrar({ ...datos, nombre: `${datos.nombre.trim()} ${datos.apellidos.trim()}`, apellidos: datos.apellidos.trim() });
    if (!res.ok) { setErrorGeneral(res.error); return; }
    navigate("/login", { state: { registrado: true } });
  };

  const p = (campo) => ({
    id: campo, value: f.valores[campo], onChange: f.cambiar, onBlur: f.salir, error: f.errorDe(campo),
  });

  return (
    <section className="auth-shell">
      <div className="auth-card auth-card-wide">
        <div className="auth-icon"><i className="bi bi-person-plus"></i></div>
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">Regístrate para inscribirte en cursos y seguir tu progreso.</p>

        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

        <form className="form-tech" noValidate onSubmit={f.enviar(alEnviar)}>
          <Campo label="Nombre" maxLength={50} {...p("nombre")} />
          <Campo label="Apellidos" maxLength={100} {...p("apellidos")} />
          <Campo label="Correo" type="email" maxLength={100} {...p("correo")} />
          <div className="row">
            <div className="col-md-6">
              <Campo label="Contraseña" type="password" maxLength={10}
                hint="8 a 10 caracteres, con mayúscula, minúscula, número y un especial (# - $ & % ! * @)."
                {...p("contrasena")} />
            </div>
            <div className="col-md-6">
              <Campo label="Confirmar contraseña" type="password" maxLength={10} {...p("confirmar")} />
            </div>
          </div>
          <Campo label={<>Teléfono <span className="text-muted">(opcional)</span></>} type="tel" maxLength={20} {...p("telefono")} />
          <div className="row">
            <div className="col-md-6">
              <Campo label="Región" as="select" {...p("region")} onChange={cambiarRegion}>
                <option disabled value="">Seleccione la región</option>
                {Object.keys(regiones).map((r) => <option key={r} value={r}>{r}</option>)}
              </Campo>
            </div>
            <div className="col-md-6">
              <Campo label="Comuna" as="select" disabled={!f.valores.region}
                hint="Se completa según la región elegida." {...p("comuna")}>
                <option disabled value="">Seleccione la comuna</option>
                {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
              </Campo>
            </div>
          </div>
          <Campo label="Dirección" maxLength={300} {...p("direccion")} />
          <button type="submit" className="btn btn-tech-primary w-100 mt-2">Registrarme</button>
        </form>

        <div className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login" className="link-tech">Inicia sesión</Link>
        </div>
      </div>
    </section>
  );
}