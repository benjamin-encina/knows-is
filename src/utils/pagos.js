/* ============================================================
   Utilidades de pago (SIMULADO: no se realiza ningún cobro real).
   Reglas de la demostración:
   - Cualquier tarjeta con número válido (algoritmo de Luhn) es aprobada.
   - La tarjeta 4000 0000 0000 0002 es rechazada, para probar el error.
   - El número completo y el CVV NUNCA se guardan: solo los últimos 4 dígitos.
   ============================================================ */

import { formatearPrecio } from "./formato";

export const TARJETA_APROBADA_DEMO = "4242 4242 4242 4242";
export const TARJETA_RECHAZADA_DEMO = "4000 0000 0000 0002";

// Descuento de la primera cuota (el banner del catálogo: "Primera cuota con descuento 20% OFF").
// Solo aplica al pagar en 2 o más cuotas; el pago único no lleva descuento.
export const DESCUENTO_PRIMERA_CUOTA = 0.2;

export const soloDigitos = (texto) => String(texto).replace(/\D/g, "");

// "4242424242424242" -> "4242 4242 4242 4242"
export const formatearTarjeta = (texto) =>
  soloDigitos(texto).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");

// "1228" -> "12/28"
export function formatearVencimiento(texto) {
  const d = soloDigitos(texto).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

// Algoritmo de Luhn: detecta números de tarjeta mal digitados
export function pasaLuhn(numero) {
  const digitos = soloDigitos(numero);
  let suma = 0;
  let doble = false;
  for (let i = digitos.length - 1; i >= 0; i--) {
    let n = Number(digitos[i]);
    if (doble) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    suma += n;
    doble = !doble;
  }
  return digitos.length > 0 && suma % 10 === 0;
}

// Plan de pago para un subtotal y una cantidad de cuotas (sin interés).
// - Las cuotas se reparten en partes iguales; la primera absorbe el resto (CLP no tiene decimales).
// - Con 2 o más cuotas, la PRIMERA cuota lleva el descuento. El descuento reduce el total a pagar.
export function planPago(subtotal, cuotas) {
  if (cuotas <= 1) {
    return { cuotas: 1, subtotal, descuento: 0, total: subtotal, primeraCuota: subtotal, valorCuota: subtotal };
  }
  const valorCuota = Math.floor(subtotal / cuotas);
  const primeraBruta = subtotal - valorCuota * (cuotas - 1);
  const descuento = Math.round(primeraBruta * DESCUENTO_PRIMERA_CUOTA);
  return {
    cuotas,
    subtotal,
    descuento,
    total: subtotal - descuento,
    primeraCuota: primeraBruta - descuento,
    valorCuota,
  };
}

// Texto legible de un plan (o de una orden guardada, que tiene los mismos campos)
export function describirPlan({ cuotas, primeraCuota, valorCuota }) {
  if (cuotas <= 1) return "Pago único";
  const pct = Math.round(DESCUENTO_PRIMERA_CUOTA * 100);
  return `${cuotas} cuotas sin interés: 1ª de ${formatearPrecio(primeraCuota)} (con ${pct}% de descuento) y ${cuotas - 1} de ${formatearPrecio(valorCuota)}`;
}

// Igual que describirPlan, pero tolera órdenes antiguas que se guardaron sin el detalle de cuotas
export function describirOrden(orden) {
  if (orden.cuotas <= 1) return "Pago único";
  if (orden.primeraCuota == null) return `${orden.cuotas} cuotas sin interés`;
  return describirPlan(orden);
}

// Simula la respuesta de la pasarela de pago (tarda ~1,5 s)
export function procesarPago({ numero }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const digitos = soloDigitos(numero);
      if (digitos === soloDigitos(TARJETA_RECHAZADA_DEMO)) {
        resolve({ ok: false, error: "El banco rechazó el pago. Prueba con otra tarjeta." });
        return;
      }
      resolve({
        ok: true,
        referencia: `PAY-${Date.now().toString(36).toUpperCase()}`,
        ultimos4: digitos.slice(-4),
      });
    }, 1500);
  });
}
