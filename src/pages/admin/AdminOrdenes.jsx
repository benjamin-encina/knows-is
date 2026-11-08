import { useState } from "react";
import AdminTopbar from "../../components/AdminTopbar";
import ResumenCupos from "../../components/ResumenCupos";
import { useCompras } from "../../context/ComprasContext";
import { formatearPrecio } from "../../utils/formato";
import { describirOrden } from "../../utils/pagos";

const formatearFechaHora = (iso) => new Date(iso).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });

export default function AdminOrdenes() {
  const { todasLasOrdenes } = useCompras();
  const [busqueda, setBusqueda] = useState("");

  const texto = busqueda.trim().toLowerCase();
  const filtradas = todasLasOrdenes.filter((orden) => {
    if (!texto) return true;
    const f = orden.facturacion ?? {};
    const campos = [orden.id, f.nombre, f.correo, f.rut, ...orden.items.map((i) => i.nombre)];
    return campos.filter(Boolean).join(" ").toLowerCase().includes(texto);
  });

  const ingresos = todasLasOrdenes.reduce((suma, o) => suma + o.total, 0);
  const alumnos = new Set(todasLasOrdenes.map((o) => o.usuarioId)).size;

  return (
    <>
      <AdminTopbar titulo="Órdenes" />

      <div className="admin-content">
        <ResumenCupos />

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <p className="small text-muted mb-0">
            {todasLasOrdenes.length} {todasLasOrdenes.length === 1 ? "orden" : "órdenes"} · {alumnos}{" "}
            {alumnos === 1 ? "alumno" : "alumnos"} · ingresos {formatearPrecio(ingresos)}
          </p>
          <input
            type="search"
            className="form-control"
            style={{ maxWidth: 320 }}
            placeholder="Buscar por orden, alumno, RUT o curso"
            aria-label="Buscar órdenes"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="admin-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-nowrap">N° orden</th>
                  <th>Fecha</th>
                  <th>Alumno</th>
                  <th>RUT</th>
                  <th>Cursos</th>
                  <th>Total</th>
                  <th>Forma de pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      {todasLasOrdenes.length === 0 ? "Aún no hay órdenes de compra." : "Ninguna orden coincide con la búsqueda."}
                    </td>
                  </tr>
                )}
                {filtradas.map((orden) => (
                  <tr key={orden.id}>
                    <td className="text-nowrap">{orden.id}</td>
                    <td className="text-muted text-nowrap">{formatearFechaHora(orden.fecha)}</td>
                    <td>
                      {orden.facturacion?.nombre ?? "—"}
                      <div className="small text-muted">{orden.facturacion?.correo}</div>
                    </td>
                    <td className="text-muted text-nowrap">{orden.facturacion?.rut ?? "—"}</td>
                    <td>{orden.items.map((i) => i.nombre).join(", ")}</td>
                    <td className="text-nowrap">
                      {formatearPrecio(orden.total)}
                      {orden.descuento > 0 && <div className="small text-muted">dto. {formatearPrecio(orden.descuento)}</div>}
                    </td>
                    <td className="small">{describirOrden(orden)}</td>
                    <td>{orden.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
