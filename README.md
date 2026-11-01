# Knows-IS (React)

Migración de la plataforma de academia tecnológica a **React + Vite**.
Proyecto académico — DuocUC, curso DSY1104.

Esta versión contiene **solo la base**: arranque del proyecto (sección 1) y componentes
comunes, layouts y rutas (sección 2). Las páginas están como provisorias
(`PaginaPendiente`) para que ninguna ruta dé 404 mientras se migran.

## Cómo ejecutarlo

```bash
npm install      # solo la primera vez (genera package-lock.json: súbanlo al repo)
npm run dev      # servidor de desarrollo → http://localhost:5173
npm run build    # compila a /dist para comprobar que no hay errores
```

Requiere Node 18 o superior.

## Estructura

```
src/
├── main.jsx            # Punto de entrada: Bootstrap, íconos, fuentes, estilos y router
├── App.jsx             # TODAS las rutas del proyecto
├── styles/styles.css   # Estilos propios (se cargan después de Bootstrap)
├── data/               # Datos mock: cursos.js y usuarios.js (fuente única de datos)
├── utils/              # Funciones auxiliares (formato de precio, y luego validaciones)
├── components/         # Navbar, Footer, AdminSidebar, AdminTopbar, CourseCard...
├── layouts/            # PublicLayout, AuthLayout, AdminLayout
└── pages/              # Una página por ruta (admin/ para el panel)
```

## Rutas

| Ruta | Layout | Archivo | Origen en la versión HTML |
|---|---|---|---|
| `/` | Público | `pages/Home.jsx` | `index.html` |
| `/cursos` (`?categoria=`) | Público | `pages/Cursos.jsx` | nuevo |
| `/cursos/:id` | Público | `pages/CursoDetalle.jsx` | nuevo |
| `/nosotros` | Público | `pages/Nosotros.jsx` | nuevo |
| `/contacto` | Público | `pages/Contacto.jsx` | nuevo |
| `/login` | Auth | `pages/Login.jsx` | `login.html` |
| `/registro` | Auth | `pages/Registro.jsx` | `registro.html` |
| `/admin` | Admin | `pages/admin/AdminHome.jsx` | nuevo |
| `/admin/cursos` | Admin | `pages/admin/AdminCursos.jsx` | `admin-cursos.html` |
| `/admin/cursos/nuevo` y `/admin/cursos/:id/editar` | Admin | `pages/admin/AdminCursoForm.jsx` | `admin-curso-form.html` |
| `/admin/usuarios` | Admin | `pages/admin/AdminUsuarios.jsx` | nuevo |
| `/admin/usuarios/nuevo` y `/admin/usuarios/:id/editar` | Admin | `pages/admin/AdminUsuarioForm.jsx` | nuevo |

## Convenciones

- Componentes y páginas: archivos en **PascalCase** (`CourseCard.jsx`); funciones y datos en camelCase.
- Un componente por archivo, con `export default`.
- **Los datos se leen siempre desde `src/data/`**, nunca se escriben a mano en una página.
- Los estilos van en `styles/styles.css`, reutilizando las clases existentes (`course-card`, `admin-card`, `form-tech`...).
- No se usa JavaScript de Bootstrap: el navbar y el desplegable se controlan con `useState`.
- Migrar una página = reemplazar el contenido de su archivo (borrando `PaginaPendiente`) y convertir el HTML a JSX:
  `class` → `className`, `for` → `htmlFor`, etiquetas autocerradas (`<input />`), `style="..."` → `style={{ ... }}`,
  y `<a href="x.html">` → `<Link to="/x">`.

## Pendientes de decisión del equipo

- Carrito: el navbar mantiene el "Cart (0)" de la versión HTML sin funcionalidad.
- Persistencia: datos mock en memoria, `localStorage` o API conectada a Oracle.
- Los cupos de ejemplo en `data/cursos.js` (2, 3, 15, 18, 20) son menores al mínimo de 25 que exige el formulario de curso: definir si "cupos" significa total o disponibles.
