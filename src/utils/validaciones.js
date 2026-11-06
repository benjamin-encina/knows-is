export const DOMINIOS_PERMITIDOS = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// al menos una minúscula, una mayúscula, un número y un caracter especial (# - $ & % ! * @)
const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#\-$&%!*@])/;

export function validarTextoObligatorio(valor, etiqueta, max) {
  const v = valor.trim();
  if (v === "") return `${etiqueta} es obligatorio.`;
  if (max && v.length > max) return `${etiqueta} no puede superar los ${max} caracteres.`;
  return "";
}

export function validarCorreo(valor, { obligatorio = true, restringirDominio = true } = {}) {
  const v = valor.trim();
  if (v === "") return obligatorio ? "El correo es obligatorio." : "";
  if (v.length > 100) return "El correo no puede superar los 100 caracteres.";
  if (!REGEX_CORREO.test(v)) return "Ingresa un correo válido (ej: nombre@dominio.com).";
  if (restringirDominio && !DOMINIOS_PERMITIDOS.some((d) => v.toLowerCase().endsWith(d))) {
    return "Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";
  }
  return "";
}

// Registro: 8 a 10 caracteres + complejidad (máx. 10 para ser coherente con la regla del login)
export function validarPasswordRegistro(valor) {
  if (valor === "") return "La contraseña es obligatoria.";
  if (valor.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (valor.length > 10) return "La contraseña no puede superar los 10 caracteres.";
  if (!REGEX_PASSWORD.test(valor)) {
    return "Debe incluir una mayúscula, una minúscula, un número y un caracter especial (# - $ & % ! * @).";
  }
  return "";
}

export function validarPasswordLogin(valor) {
  if (valor === "") return "La contraseña es obligatoria.";
  if (valor.length < 4 || valor.length > 10) return "La contraseña debe tener entre 4 y 10 caracteres.";
  return "";
}

export function validarConfirmacion(password, confirmar) {
  if (confirmar === "") return "Debes confirmar la contraseña.";
  if (password !== confirmar) return "Las contraseñas no coinciden.";
  return "";
}

export function validarTelefono(valor) {
  const v = valor.replace(/\s/g, "");
  if (v === "") return ""; // opcional
  if (!/^\+?\d{9,12}$/.test(v)) return "Ingresa un teléfono válido (9 a 12 dígitos, ej: +56912345678).";
  return "";
}

export function validarComentario(valor) {
  const v = valor.trim();
  if (v === "") return "El comentario es obligatorio.";
  if (v.length > 500) return "El comentario no puede superar los 500 caracteres.";
  return "";
}

export function validarSeleccion(valor, etiqueta) {
  return valor === "" ? `Selecciona ${etiqueta}.` : "";
}