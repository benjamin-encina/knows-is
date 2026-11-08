import { pasaLuhn, soloDigitos } from "./pagos";

export function validarNumeroTarjeta(valor) {
  const d = soloDigitos(valor);
  if (d === "") return "El número de tarjeta es obligatorio.";
  if (d.length < 13 || d.length > 19) return "El número de tarjeta debe tener entre 13 y 19 dígitos.";
  if (!pasaLuhn(d)) return "El número de tarjeta no es válido.";
  return "";
}

export function validarVencimiento(valor) {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(valor)) return "Usa el formato MM/AA (ej: 08/28).";
  const [mes, aa] = valor.split("/").map(Number);
  const anio = 2000 + aa;
  const hoy = new Date();
  if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) {
    return "La tarjeta está vencida.";
  }
  if (anio > hoy.getFullYear() + 20) return "La fecha de vencimiento no es válida.";
  return "";
}

export function validarCvv(valor) {
  return /^\d{3,4}$/.test(valor) ? "" : "El CVV debe tener 3 o 4 dígitos.";
}
