import { useState } from "react";
import Campo from "../components/Campo";
import useFormulario from "../hooks/useFormulario";
import { validarTextoObligatorio, validarCorreo, validarComentario } from "../utils/validaciones";

const validar = (v) => ({
  nombre: validarTextoObligatorio(v.nombre, "El nombre", 100),
  // correo opcional según la planilla; si se escribe, debe tener formato válido
  correo: validarCorreo(v.correo, { obligatorio: false, restringirDominio: false }),
  comentario: validarComentario(v.comentario),
});

export default function Contacto() {
  const [enviado, setEnviado] = useState(false);
  const f = useFormulario({ nombre: "", correo: "", comentario: "" }, validar);

  const alEnviar = () => { setEnviado(true); f.reiniciar(); };

  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Contacto</span>
          <h1>¿Tienes dudas antes de inscribirte?</h1>
          <p className="lead mt-3">Escríbenos y te respondemos a la brevedad.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5">
              <h2 className="h5 mb-3">Otras formas de contactarnos</h2>
              {[
                ["bi-envelope", "Correo", "contacto@knows-is.cl"],
                ["bi-geo-alt", "Ubicación", "Santiago, Chile"],
                ["bi-clock", "Horario de atención", "Lunes a viernes, 9:00 a 18:00"],
              ].map(([icono, titulo, texto]) => (
                <div className="d-flex gap-3 mb-3" key={titulo}>
                  <div className="value-icon flex-shrink-0"><i className={`bi ${icono}`}></i></div>
                  <div>
                    <div className="fw-semibold">{titulo}</div>
                    <div className="text-muted small">{texto}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-lg-7">
              <form className="form-tech admin-card p-4 p-md-5" noValidate onSubmit={f.enviar(alEnviar)}>
                {enviado && (
                  <div className="alert alert-success" role="alert">¡Mensaje enviado! Te responderemos pronto.</div>
                )}
                <Campo id="nombre" label="Nombre completo" maxLength={100} hint="Máximo 100 caracteres."
                  value={f.valores.nombre} onChange={f.cambiar} onBlur={f.salir} error={f.errorDe("nombre")} />
                <Campo id="correo" label="Correo (opcional)" type="email" maxLength={100}
                  value={f.valores.correo} onChange={f.cambiar} onBlur={f.salir} error={f.errorDe("correo")} />
                <Campo id="comentario" label="Comentario" as="textarea" rows={5} maxLength={500}
                  hint={`${f.valores.comentario.length}/500 caracteres.`}
                  value={f.valores.comentario} onChange={f.cambiar} onBlur={f.salir} error={f.errorDe("comentario")} />
                <button type="submit" className="btn btn-tech-primary w-100">Enviar mensaje</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}