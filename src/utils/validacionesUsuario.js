// Validaciones del formulario de usuarios (admin).
// Cada función devuelve "" si está bien o el mensaje de error.
import { roles } from "../data/usuarios";
import { validarPasswordRegistro } from "./validaciones";

const estados = ["Activo", "Inactivo"];

// Al crear, la contraseña es obligatoria. Al editar se puede dejar vacía (se conserva la actual).
export function validarPasswordUsuario(valor, { obligatoria }) {
  if (valor === "") return obligatoria ? "La contraseña es obligatoria." : "";
  return validarPasswordRegistro(valor);
}

export function validarRol(valor) {
  if (valor === "") return "Selecciona un rol.";
  if (!roles.includes(valor)) return "Rol no válido.";
  return "";
}

export function validarEstado(valor) {
  if (valor === "") return "Selecciona un estado.";
  if (!estados.includes(valor)) return "Estado no válido.";
  return "";
}

// usuarios: lista actual. idActual: id del usuario que se edita (null si es nuevo).
export function validarCorreoUnico(correo, usuarios, idActual = null) {
  const c = correo.trim().toLowerCase();
  if (c === "") return "";
  const repetido = usuarios.some((u) => u.correo.toLowerCase() === c && String(u.id) !== String(idActual));
  return repetido ? "Ya existe un usuario con ese correo." : "";
}