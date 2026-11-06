import { Link } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import { useCursos } from "../context/CursosContext";

export default function Home() {
  const { cursos } = useCursos();
  const destacados = cursos.filter((curso) => curso.destacado);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="mb-3">Aprende tecnología con cursos hechos por quienes programan a diario.</h1>
              <p className="lead">
                Creamos cursos para que aprendas desde cero, desde los fundamentos hasta desenvolverte como los expertos.
              </p>
              <div className="d-flex gap-3 mt-4">
                <Link to="/cursos" className="btn btn-tech-primary">Ver cursos</Link>
                <Link to="/nosotros" className="btn btn-tech-outline">Conocer la academia</Link>
              </div>
              <div className="hero-stats">
                <div><div className="stat-value">{cursos.length}</div><div className="stat-label">cursos disponibles</div></div>
                <div><div className="stat-value">1.200+</div><div className="stat-label">alumnos inscritos</div></div>
                <div><div className="stat-value">4.8/5</div><div className="stat-label">valoración promedio</div></div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="code-panel">
                <div className="code-panel-bar">
                  <span className="code-dot"></span><span className="code-dot"></span><span className="code-dot"></span>
                </div>
                <pre>
                  <span className="tok-com">// tu próximo curso, un paso a la vez</span>{"\n"}
                  <span className="tok-key">const</span> alumno = {"{"}{"\n"}
                  {"  "}nombre: <span className="tok-str">"Kevin"</span>,{"\n"}
                  {"  "}cursoActual: <span className="tok-str">"JavaScript desde cero"</span>,{"\n"}
                  {"  "}progreso: <span className="tok-str">"68%"</span>,{"\n"}
                  {"}"};{"\n"}{"\n"}
                  <span className="tok-key">function</span> siguienteClase(alumno) {"{"}{"\n"}
                  {"  "}<span className="tok-key">return</span> <span className="tok-str">{"`Continuemos, ${alumno.nombre}`"}</span>;{"\n"}
                  {"}"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="h4 mb-4">Cursos destacados</h2>
          <div className="row g-4">
            {destacados.map((curso) => (
              <div className="col-md-4" key={curso.id}>
                <CourseCard curso={curso} />
              </div>
            ))}
          </div>
          <p className="mt-4 mb-0">
            <Link to="/cursos" className="link-tech">Ver todos los cursos →</Link>
          </p>
        </div>
      </section>
    </>
  );
}