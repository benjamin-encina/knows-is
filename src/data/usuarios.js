/* ============================================================
   Datos de ejemplo de usuarios (mock).
   Las contraseñas están en texto plano SOLO porque esto es una
   simulación sin backend. Con una API real nunca se guardan así.
   Reglas del login: contraseña de 4 a 10 caracteres y correo
   @knowsis.cl
   ============================================================ */

export const roles = ["Admin", "Instructor", "Alumno"];

export const usuarios = [
  {
    id: 1,
    nombre: "Benjamín Encina",
    correo: "benjamin@knowsis.cl",
    contrasena: "1234",
    rol: "Admin",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "Kevin Pincheira",
    correo: "kevin@knowsis.cl",
    contrasena: "1234",
    rol: "Admin",
    estado: "Activo",
  },
  {
    id: 3,
    nombre: "Ghislane Carrasco",
    correo: "ghislane@knowsis.cl",
    contrasena: "1234",
    rol: "Admin",
    estado: "Activo",
  },
  {
    id: 4,
    nombre: "Alumno",
    correo: "alumno@knowsis.cl",
    contrasena: "1234",
    rol: "Alumno",
    estado: "Activo",
  }
];
