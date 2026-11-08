// Utilidades para el RUT chileno (formato 12.345.678-5, con dígito verificador módulo 11).

export const limpiarRut = (valor) => String(valor).replace(/[^0-9kK]/g, "").toUpperCase();

// Va dando formato mientras se escribe: "123456785" -> "12.345.678-5"
export function formatearRut(valor) {
  const limpio = limpiarRut(valor).slice(0, 9);
  if (limpio.length <= 1) return limpio;
  const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpo}-${limpio.slice(-1)}`;
}

export function calcularDv(cuerpo) {
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
}

export function validarRut(valor) {
  const limpio = limpiarRut(valor);
  if (limpio === "") return "El RUT es obligatorio.";
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (cuerpo.length < 7 || cuerpo.length > 8 || !/^\d+$/.test(cuerpo)) {
    return "Ingresa un RUT válido (ej: 12.345.678-5).";
  }
  if (calcularDv(cuerpo) !== dv) return "El RUT no es válido: revisa el dígito verificador.";
  return "";
}
