const valores = [
  { icono: "bi-bullseye", titulo: "Nuestra misión", texto: "Acercar la tecnología a cualquier persona, sin importar su punto de partida, con cursos cortos y aplicables desde la primera semana." },
  { icono: "bi-people", titulo: "Cómo enseñamos", texto: "Instructores que trabajan en la industria, grupos pequeños y contenido que se actualiza con lo que hoy piden las empresas." },
  { icono: "bi-graph-up-arrow", titulo: "A dónde vamos", texto: "Seguir sumando cursos y especialidades a medida que la industria tech evoluciona, siempre con foco en la práctica." },
];
const equipo = [
  { nombre: "Benjamín Encina", rol: "Profesor en cursos de Ciberseguridad e Infraestructura" },
  { nombre: "Kevin Pincheira", rol: "Profesor en cursos de Quality Assurance & Back-End" },
  { nombre: "Ghislaine Carrasco", rol: "Profesora en cursos de Desarrollo & Front-End" },
];

export default function Nosotros() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Nosotros</span>
          <h1>Formamos personas, no solo llenamos horas de clase</h1>
          <p className="lead mt-3">
            Knows-IS nace de un equipo que programa a diario y quiere que aprender tecnología sea directo, práctico y sin relleno teórico.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row g-4">
            {valores.map((v) => (
              <div className="col-md-4" key={v.titulo}>
                <div className="value-card">
                  <div className="value-icon"><i className={`bi ${v.icono}`}></i></div>
                  <h3 className="h5">{v.titulo}</h3>
                  <p className="text-muted small mb-0">{v.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="h4 mb-4">El equipo</h2>
          <div className="row g-4">
            {equipo.map((p) => (
              <div className="col-md-4" key={p.nombre}>
                <div className="team-card">
                  <div className="team-avatar"></div>
                  <h3 className="h6 mb-0">{p.nombre}</h3>
                  <div className="team-role">{p.rol}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}