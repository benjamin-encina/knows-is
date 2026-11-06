import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Campo from "../components/Campo";
import useFormulario from "../hooks/useFormulario";
import { useAuth } from "../context/AuthContext";
import { validarCorreo, validarPasswordLogin } from "../utils/validaciones";

const validar = (v) => ({
  correo: validarCorreo(v.correo),
  contrasena: validarPasswordLogin(v.contrasena),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorGeneral, setErrorGeneral] = useState("");
  const f = useFormulario({ correo: "", contrasena: "" }, validar);

  const alEnviar = ({ correo, contrasena }) => {
    const res = login(correo, contrasena);
    if (!res.ok) { setErrorGeneral(res.error); return; }
    const destino = location.state?.desde || (res.usuario.rol === "Admin" ? "/admin" : "/");
    navigate(destino, { replace: true });
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="auth-icon"><i className="bi bi-lock"></i></div>
        <h1>Iniciar sesión</h1>
        <p className="auth-subtitle">Ingresa con tu correo y contraseña para continuar tus cursos.</p>

        {location.state?.registrado && (
          <div className="alert alert-success" role="alert">¡Cuenta creada! Ahora puedes iniciar sesión.</div>
        )}
        {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

        <form className="form-tech" noValidate onSubmit={f.enviar(alEnviar)}>
          <Campo id="correo" label="Correo" type="email" maxLength={100}
            value={f.valores.correo} onChange={(e) => { setErrorGeneral(""); f.cambiar(e); }}
            onBlur={f.salir} error={f.errorDe("correo")} />
          <Campo id="contrasena" label="Contraseña" type="password" maxLength={10}
            value={f.valores.contrasena} onChange={(e) => { setErrorGeneral(""); f.cambiar(e); }}
            onBlur={f.salir} error={f.errorDe("contrasena")} />
          <button type="submit" className="btn btn-tech-primary w-100 mt-2">Acceder</button>
        </form>

        <div className="auth-switch">
          ¿Aún no tienes cuenta? <Link to="/registro" className="link-tech">Regístrate aquí</Link>
        </div>
      </div>
    </section>
  );
}
