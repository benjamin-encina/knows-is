/* ============================================================
   Datos de ejemplo de usuarios (mock).
   Las contraseñas están en texto plano SOLO porque esto es una
   simulación sin backend. Con una API real nunca se guardan así.
   Reglas del login: contraseña de 4 a 10 caracteres y correo
   @duoc.cl / @profesor.duoc.cl / @gmail.com.
   ============================================================ */

export const roles = ["Admin", "Instructor", "Alumno"];

export const usuarios = [
  {
    id: 1,
    nombre: "Benjamín Rojas",
    correo: "benjamin@profesor.duoc.cl",
    contrasena: "1234",
    rol: "Admin",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "Kevin Soto",
    correo: "kevin@profesor.duoc.cl",
    contrasena: "1234",
    rol: "Instructor",
    estado: "Activo",
  },
  {
    id: 3,
    nombre: "Alumno Demo",
    correo: "alumno@duoc.cl",
    contrasena: "1234",
    rol: "Alumno",
    estado: "Activo",
  },
];
