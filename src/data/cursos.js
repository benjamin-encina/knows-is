/* ============================================================
   Datos de ejemplo de cursos (mock).
   Fuente única para el sitio público Y el panel de administrador:
   ambos deben leer de aquí para no tener datos duplicados.

   Cuando se conecte la API / Oracle, este archivo se reemplaza
   por llamadas fetch, pero la forma de los objetos se mantiene.
   ============================================================ */

// slug = lo que viaja en la URL (?categoria=redes), nombre = lo que se muestra.
// enMenu = aparece en el desplegable "Cursos" del navbar.
export const categorias = [
  { slug: "programacion", nombre: "Programación", enMenu: true },
  { slug: "redes", nombre: "Redes", enMenu: true },
  { slug: "diseno", nombre: "Diseño digital", enMenu: true },
  { slug: "ciberseguridad", nombre: "Ciberseguridad", enMenu: false },
  { slug: "datos", nombre: "Datos", enMenu: false },
  { slug: "ia", nombre: "Inteligencia Artificial", enMenu: false },
];

export const niveles = ["Inicial", "Intermedio", "Avanzado"];

export const instructores = ["Kevin Soto", "Benjamín Rojas"];

export const cursos = [
  {
    id: 1,
    codigo: "10001",
    nombre: "JavaScript desde cero",
    descripcion: "Domina la base del desarrollo web moderno, paso a paso.",
    precio: 210000,
    cupos: 20,
    cupoCritico: 5,
    categoria: "programacion",
    nivel: "Inicial",
    instructor: "Kevin Soto",
    imagen: "https://picsum.photos/seed/knowsis-js/480/270",
    icono: "bi-code-slash",
    destacado: true,
    nuevo: false,
  },
  {
    id: 2,
    codigo: "10002",
    nombre: "Fundamentos de Ciberseguridad",
    descripcion: "Conoce las amenazas más comunes y cómo proteger sistemas y datos.",
    precio: 450000,
    cupos: 2,
    cupoCritico: 5,
    categoria: "ciberseguridad",
    nivel: "Intermedio",
    instructor: "Benjamín Rojas",
    imagen: "https://picsum.photos/seed/knowsis-ciber/480/270",
    icono: "bi-shield-lock",
    destacado: false,
    nuevo: false,
  },
  {
    id: 3,
    codigo: "10003",
    nombre: "UX/UI para Producto Digital",
    descripcion: "Diseña interfaces claras y centradas en la persona usuaria.",
    precio: 260000,
    cupos: 18,
    cupoCritico: 5,
    categoria: "diseno",
    nivel: "Inicial",
    instructor: "Kevin Soto",
    imagen: "https://picsum.photos/seed/knowsis-ux/480/270",
    icono: "bi-palette",
    destacado: true,
    nuevo: false,
  },
  {
    id: 4,
    codigo: "10004",
    nombre: "Administración de Redes",
    descripcion: "Configura y administra infraestructura de red desde cero.",
    precio: 320000,
    cupos: 15,
    cupoCritico: 5,
    categoria: "redes",
    nivel: "Intermedio",
    instructor: "Benjamín Rojas",
    imagen: "https://picsum.photos/seed/knowsis-redes/480/270",
    icono: "bi-diagram-3",
    destacado: true,
    nuevo: false,
  },
  {
    id: 5,
    codigo: "10005",
    nombre: "Ingeniería de Prompts y Agentes IA",
    descripcion: "Aprende a diseñar prompts y agentes que resuelvan tareas reales.",
    precio: 390000,
    cupos: 3,
    cupoCritico: 5,
    categoria: "ia",
    nivel: "Inicial",
    instructor: "Kevin Soto",
    imagen: "https://picsum.photos/seed/knowsis-ia/480/270",
    icono: "bi-robot",
    destacado: false,
    nuevo: true,
  },
];

/* ---------- Helpers ---------- */

export function nombreCategoria(slug) {
  const categoria = categorias.find((c) => c.slug === slug);
  return categoria ? categoria.nombre : slug;
}

// true si los cupos están en o bajo el mínimo crítico definido para el curso
export function cupoEnAlerta(curso) {
  return curso.cupoCritico != null && curso.cupos <= curso.cupoCritico;
}
