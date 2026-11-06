// Reglas de validaciones.js (formulario de cursos) convertidas a funciones puras:
// reciben el valor y devuelven "" si está OK o el mensaje de error.

export const EXTENSIONES_IMAGEN_VALIDAS = ["jpg", "jpeg", "png", "webp", "gif"];

const esEntero = (valor) => /^-?\d+$/.test(String(valor).trim());
const esNumero = (valor) => valor !== "" && !isNaN(Number(valor));

export function validarCodigo(valor) {
  const v = valor.trim();
  if (v === "") return "El código del curso es obligatorio.";
  if (v.length < 3) return "El código debe tener al menos 3 caracteres.";
  return "";
}

export function validarNombre(valor) {
  const v = valor.trim();
  if (v === "") return "El nombre del curso es obligatorio.";
  if (v.length > 100) return "El nombre no puede superar los 100 caracteres.";
  return "";
}

export function validarDescripcion(valor) {
  // opcional: solo se valida el largo máximo
  if (valor.trim().length > 500) return "La descripción no puede superar los 500 caracteres.";
  return "";
}

export function validarPrecio(valor) {
  const v = valor.trim();
  if (v === "") return "Ingresa el precio del curso.";
  if (!esNumero(v)) return "El precio debe ser un valor numérico.";
  if (Number(v) < 0) return "El precio no puede ser negativo (usa 0 para un curso gratuito).";
  return "";
}

export function validarCupos(valor) {
  const v = valor.trim();
  if (v === "") return "Ingresa la cantidad de cupos.";
  if (!esEntero(v)) return "Los cupos deben ser un número entero (sin decimales).";
  if (Number(v) < 0) return "Los cupos no pueden ser negativos.";
  return "";
}

export function validarCupoCritico(valor, cupos) {
  const v = valor.trim();
  if (v === "") return ""; // opcional
  if (!esEntero(v)) return "El cupo crítico debe ser un número entero (sin decimales).";
  if (Number(v) < 0) return "El cupo crítico no puede ser negativo.";
  if (esEntero(cupos) && Number(v) > Number(cupos)) {
    return "El cupo crítico no puede ser mayor que los cupos totales.";
  }
  return "";
}

// archivo: objeto File o null (opcional)
export function validarImagen(archivo) {
  if (!archivo) return "";
  const extension = archivo.name.split(".").pop().toLowerCase();
  if (!EXTENSIONES_IMAGEN_VALIDAS.includes(extension)) return "Formato no válido. Usa jpg, jpeg, png, webp o gif.";
  return "";
}