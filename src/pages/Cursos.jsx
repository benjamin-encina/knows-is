import { useSearchParams } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import { categorias, niveles, nombreCategoria } from "../data/cursos";
import { useCursos } from "../context/CursosContext";

export default function Cursos() {
  
  const { cursos } = useCursos();
  const [params, setParams] = useSearchParams();
  const categoria = params.get("categoria") || "";
  const nivel = params.get("nivel") || "";
  const q = params.get("q") || "";

  const cambiar = (clave, valor) => {
    const nuevo = new URLSearchParams(params);
    if (valor) nuevo.set(clave, valor);
    else nuevo.delete(clave);
    setParams(nuevo, { replace: true });
  };

  const texto = q.trim().toLowerCase();
  const filtrados = cursos.filter(
    (c) =>
      (!categoria || c.categoria === categoria) &&
      (!nivel || c.nivel === nivel) &&
      (!texto || c.nombre.toLowerCase().includes(texto) || c.descripcion.toLowerCase().includes(texto))
  );

  // Sin filtros en la URL (/cursos a secas) se muestran TODOS los cursos
  const hayFiltros = Boolean(categoria || nivel || texto);

  return (
    <>
      <section className="catalog-hero">
        <div className="container">
          <h1>¿Qué deseas descubrir y aprender?</h1>

          <div className="catalog-banner">
            <div>
              <div className="banner-eyebrow">Beneficio por tiempo limitado</div>
              <div className="banner-title">Primera cuota con descuento</div>
            </div>
            <div className="banner-discount">20% OFF</div>
          </div>

          <form className="filter-bar" onSubmit={(e) => e.preventDefault()}>
            <input type="search" className="form-control flex-grow-1" placeholder="Buscar cursos"
              aria-label="Buscar cursos" value={q} onChange={(e) => cambiar("q", e.target.value)} />
            <select className="form-select" style={{ maxWidth: 200 }} aria-label="Filtrar por categoría"
              value={categoria} onChange={(e) => cambiar("categoria", e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c.slug} value={c.slug}>{c.nombre}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 180 }} aria-label="Filtrar por nivel"
              value={nivel} onChange={(e) => cambiar("nivel", e.target.value)}>
              <option value="">Todos los niveles</option>
              {niveles.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <span className="small text-muted">
              Mostrando {filtrados.length} de {cursos.length} {cursos.length === 1 ? "curso" : "cursos"}
              {categoria && ` en ${nombreCategoria(categoria)}`}
            </span>
            {hayFiltros && (
              <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setParams({}, { replace: true })}>
                Limpiar filtros
              </button>
            )}
          </div>

          {filtrados.length === 0 ? (
            <p className="text-muted text-center">No encontramos cursos con esos filtros.</p>
          ) : (
            <div className="row g-4">
              {filtrados.map((curso) => (
                <div className="col-md-6 col-lg-4" key={curso.id}>
                  <CourseCard curso={curso} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
} 