import { useCursos } from "../context/CursosContext";
import { useCompras } from "../context/ComprasContext";
import { cupoEnAlerta } from "../data/cursos";

// Contador de cupos del panel admin: cuántos están ocupados ahora, cuántos quedan y cuántos
// cursos tienen cupo crítico. Se recalcula solo cada vez que un usuario adquiere un curso.
export default function ResumenCupos() {
  const { cursos } = useCursos();
  const { ocupadosDe } = useCompras();

  const totales = cursos.reduce((suma, c) => suma + c.cupos, 0);
  const ocupados = cursos.reduce((suma, c) => suma + Math.min(ocupadosDe(c.id), c.cupos), 0);
  const criticos = cursos.filter((c) => cupoEnAlerta(c, ocupadosDe(c.id))).length;
  const porcentaje = totales === 0 ? 0 : Math.round((ocupados / totales) * 100);

  return (
    <div className="admin-card p-4 mb-4">
      <div className="row g-3 align-items-center">
        <div className="col-6 col-md-3">
          <div className="text-muted small">Cupos ocupados</div>
          <div className="fs-2 fw-bold" aria-live="polite">
            {ocupados}
            <span className="fs-6 text-muted fw-normal"> / {totales}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-muted small">Cupos disponibles</div>
          <div className="fs-2 fw-bold">{totales - ocupados}</div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-muted small">Cursos con cupo crítico</div>
          <div className="fs-2 fw-bold">
            {criticos > 0 && <span className="status-dot status-warn"></span>}
            {criticos}
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-muted small mb-1">Ocupación · {porcentaje}%</div>
          <div className="progress" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} style={{ height: 8 }}>
            <div className="progress-bar" style={{ width: `${porcentaje}%`, backgroundColor: "var(--accent-2)" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
