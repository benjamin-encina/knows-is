import { Link } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import PaginaPendiente from "../components/PaginaPendiente";
import { cursos } from "../data/cursos";

// PENDIENTE (sección 3): migrar el contenido de index.html (hero, estadísticas, panel de código).
// Mientras tanto, esta página sirve para comprobar que CourseCard y el archivo de datos funcionan.
// Al migrar el home, se puede conservar el bloque de "Cursos destacados" tal cual.
export default function Home() {
  const destacados = cursos.filter((curso) => curso.destacado);

  return (
    <>
      <PaginaPendiente titulo="Home" archivoOrigen="index.html" seccion="3. Sitio público" />

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
