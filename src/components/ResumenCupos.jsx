import { useEffect } from "react";
import { useCompras } from "../context/ComprasContext";

// Contador de cupos del panel admin. Los números los calcula el backend (GET /api/admin/cupos):
// ocupados = cursos en órdenes pagadas, disponibles = totales − ocupados, y cursos con cupo crítico.
export default function ResumenCupos() {
  const { resumenCupos: r, errorCupos, cargarResumenCupos } = useCompras();

  useEffect(() => {
    cargarResumenCupos();
  }, [cargarResumenCupos]);

  if (errorCupos) {
    return <div className="alert alert-danger mb-4" role="alert">No se pudo cargar el resumen de cupos: {errorCupos}</div>;
  }
  if (!r) {
    return <div className="admin-card p-4 mb-4 text-muted">Cargando cupos…</div>;
  }

  const porcentaje = r.cuposTotales === 0 ? 0 : Math.round((r.cuposOcupados / r.cuposTotales) * 100);

  return (
    <div className="admin-card p-4 mb-4">
      <div className="row g-3 align-items-center">
        <div className="col-6 col-md-3">
          <div className="text-muted small">Cupos ocupados</div>
          <div className="fs-2 fw-bold" aria-live="polite">
            {r.cuposOcupados}
            <span className="fs-6 text-muted fw-normal"> / {r.cuposTotales}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-muted small">Cupos disponibles</div>
          <div className="fs-2 fw-bold">{r.cuposDisponibles}</div>
        </div>
        <div className="col-6 col-md-3">
          <div className="text-muted small">Cursos con cupo crítico</div>
          <div className="fs-2 fw-bold">
            {r.cursosConCupoCritico > 0 && <span className="status-dot status-warn"></span>}
            {r.cursosConCupoCritico}
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
