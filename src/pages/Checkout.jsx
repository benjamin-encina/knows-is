import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Campo from "../components/Campo";
import ResumenOrden from "../components/ResumenOrden";
import useFormulario from "../hooks/useFormulario";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import { useCompras } from "../context/ComprasContext";
import { formatearPrecio } from "../utils/formato";
import {
  DESCUENTO_PRIMERA_CUOTA, TARJETA_APROBADA_DEMO, TARJETA_RECHAZADA_DEMO,
  describirPlan, formatearTarjeta, formatearVencimiento, planPago, procesarPago, soloDigitos,
} from "../utils/pagos";
import { formatearRut, validarRut } from "../utils/rut";
import { validarCorreo, validarTelefono, validarTextoObligatorio } from "../utils/validaciones";
import { validarCvv, validarNumeroTarjeta, validarVencimiento } from "../utils/validacionesPago";

const OPCIONES_CUOTAS = [1, 3, 6];
const PORCENTAJE = Math.round(DESCUENTO_PRIMERA_CUOTA * 100);

const validar = (v) => ({
  nombre: validarTextoObligatorio(v.nombre, "El nombre", 100),
  rut: validarRut(v.rut),
  correo: validarCorreo(v.correo, { restringirDominio: false }),
  telefono: validarTelefono(v.telefono),
  direccion: validarTextoObligatorio(v.direccion, "La dirección", 300),
  tarjetaNumero: validarNumeroTarjeta(v.tarjetaNumero),
  tarjetaTitular: validarTextoObligatorio(v.tarjetaTitular, "El nombre del titular", 60),
  vencimiento: validarVencimiento(v.vencimiento),
  cvv: validarCvv(v.cvv),
});

export default function Checkout() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { items, total: subtotal } = useCarrito();
  const { validarCarrito, confirmarCompra } = useCompras();
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState("");
  // al confirmar la compra el carrito se vacía: esta marca evita que eso nos mande a /carrito
  const compraHecha = useRef(false);

  const f = useFormulario(
    {
      nombre: usuario?.nombre ?? "", rut: usuario?.rut ?? "", correo: usuario?.correo ?? "",
      telefono: usuario?.telefono ?? "", direccion: usuario?.direccion ?? "",
      tarjetaNumero: "", tarjetaTitular: "", vencimiento: "", cvv: "", cuotas: "1",
    },
    validar
  );

  const plan = planPago(subtotal, Number(f.valores.cuotas));

  const p = (campo) => ({
    id: campo, value: f.valores[campo], onChange: f.cambiar, onBlur: f.salir, error: f.errorDe(campo),
  });
  // igual que p(), pero reformatea lo que se escribe (espacios de la tarjeta, "/" del vencimiento, puntos del RUT)
  const conFormato = (campo, formatear) => ({
    ...p(campo),
    onChange: (e) => {
      e.target.value = formatear(e.target.value);
      f.cambiar(e);
    },
  });

  const textoOpcion = (n) => {
    const opcion = planPago(subtotal, n);
    return n === 1
      ? `Pago único · ${formatearPrecio(opcion.total)}`
      : `${n} cuotas sin interés · 1ª de ${formatearPrecio(opcion.primeraCuota)} (${PORCENTAJE}% dto.)`;
  };

  if (items.length === 0 && !compraHecha.current) return <Navigate to="/carrito" replace />;

  const alEnviar = async (v) => {
    setErrorPago("");

    // 1) Revisar cupos y duplicados ANTES de cobrar
    const problema = validarCarrito();
    if (problema) { setErrorPago(problema); return; }

    // 2) Cobrar (simulado)
    setProcesando(true);
    const pago = await procesarPago({ numero: v.tarjetaNumero });
    if (!pago.ok) { setErrorPago(pago.error); setProcesando(false); return; }

    // 3) Registrar la adquisición. Del número de tarjeta solo se conservan los últimos 4 dígitos.
    compraHecha.current = true;
    const res = confirmarCompra({
      facturacion: {
        nombre: v.nombre.trim(), rut: v.rut, correo: v.correo.trim(),
        telefono: v.telefono.trim(), direccion: v.direccion.trim(),
      },
      cuotas: Number(v.cuotas),
      pago: { medio: `Tarjeta •••• ${soloDigitos(v.tarjetaNumero).slice(-4)}`, referencia: pago.referencia },
    });
    if (!res.ok) { compraHecha.current = false; setErrorPago(res.error); setProcesando(false); return; }
    navigate(`/compra/exito/${res.orden.id}`, { replace: true });
  };

  return (
    <section className="section" style={{ paddingTop: "3rem" }}>
      <div className="container">
        <nav className="breadcrumb-tech">
          <Link to="/carrito">Carrito</Link> › Pago
        </nav>
        <h1 className="h3 mb-4">Finalizar compra</h1>

        <div className="row g-4">
          <div className="col-lg-7">
            <form id="form-checkout" className="form-tech" noValidate onSubmit={f.enviar(alEnviar)}>
              <div className="admin-card p-4 mb-4">
                <h2 className="h5 mb-3">1. Datos de facturación</h2>
                <div className="row">
                  <div className="col-md-7"><Campo label="Nombre completo" maxLength={100} {...p("nombre")} /></div>
                  <div className="col-md-5">
                    <Campo label="RUT" placeholder="12.345.678-5" maxLength={12} {...conFormato("rut", formatearRut)} />
                  </div>
                </div>
                <Campo label="Correo" type="email" maxLength={100} {...p("correo")} />
                <Campo label="Teléfono (opcional)" type="tel" placeholder="+56912345678" {...p("telefono")} />
                <Campo label="Dirección" maxLength={300} placeholder="Calle, número, comuna" {...p("direccion")} />
              </div>

              <div className="admin-card p-4">
                <h2 className="h5 mb-3">2. Pago con tarjeta</h2>
                <div className="alert alert-info small" role="note">
                  <strong>Modo demostración:</strong> no se realiza ningún cobro real. Usa{" "}
                  <code>{TARJETA_APROBADA_DEMO}</code> para un pago aprobado o{" "}
                  <code>{TARJETA_RECHAZADA_DEMO}</code> para ver un pago rechazado.
                </div>

                {errorPago && <div className="alert alert-danger" role="alert">{errorPago}</div>}

                <Campo label="Número de tarjeta" inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000"
                  {...conFormato("tarjetaNumero", formatearTarjeta)} />
                <Campo label="Nombre del titular" maxLength={60} autoComplete="off" {...p("tarjetaTitular")} />
                <div className="row">
                  <div className="col-6">
                    <Campo label="Vencimiento" inputMode="numeric" autoComplete="off" placeholder="MM/AA"
                      {...conFormato("vencimiento", formatearVencimiento)} />
                  </div>
                  <div className="col-6">
                    <Campo label="CVV" type="password" inputMode="numeric" maxLength={4} autoComplete="off"
                      {...p("cvv")} />
                  </div>
                </div>
                <Campo as="select" label="Forma de pago" {...p("cuotas")}>
                  {OPCIONES_CUOTAS.map((n) => (
                    <option key={n} value={n}>{textoOpcion(n)}</option>
                  ))}
                </Campo>
              </div>
            </form>
          </div>

          <div className="col-lg-5">
            <ResumenOrden items={items} total={plan.total} descuento={plan.descuento} titulo="Tu pedido">
              <button type="submit" form="form-checkout" className="btn btn-tech-primary w-100" disabled={procesando}>
                {procesando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    Procesando pago…
                  </>
                ) : plan.cuotas === 1 ? (
                  `Pagar ${formatearPrecio(plan.total)}`
                ) : (
                  `Pagar 1ª cuota ${formatearPrecio(plan.primeraCuota)}`
                )}
              </button>
              <p className="text-muted small text-center mt-2 mb-0">{describirPlan(plan)}</p>
            </ResumenOrden>
          </div>
        </div>
      </div>
    </section>
  );
}
