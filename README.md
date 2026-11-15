# Knows-IS · Frontend

Sitio y panel de administración de la academia Knows-IS (DSY1104). React 18 · Vite · React Router · Bootstrap · Vitest.
La API está en el repositorio `knows-is-backend` (Spring Boot).

## Cómo ejecutarlo

```bash
npm install          # solo la primera vez
npm run dev          # http://localhost:5173
npm test             # pruebas (Vitest)
npm run coverage     # pruebas + informe de cobertura
npm run build        # compila a /dist
```

Requiere Node 18 o superior.

### Conexión con el backend

1. Copia `.env.example` como `.env` (en PowerShell: `Copy-Item .env.example .env`). Ahí está `VITE_API_URL` (por defecto `http://localhost:8080`).
2. Levanta el backend (ver su README) antes de abrir la app.

Todas las llamadas HTTP pasan por `src/api/client.js`; cada recurso tiene su módulo (`cursosApi`, `authApi`, `usuariosApi`, `ordenesApi`).
El contrato completo (endpoints, JSON, permisos) está en `docs/contrato-api.md` del repositorio del backend.

> Estado: la base de la integración (cliente HTTP y módulos de API) ya está. Mientras cada frente conecta su parte,
> la app sigue funcionando con datos locales (`localStorage`).
>
> | Parte | Se conecta a la API |
> |---|---|
> | Cursos (catálogo, detalle, admin de cursos) | Frente A |
> | Autenticación, sesión, permisos y usuarios | Frente B |
> | Carrito, compras, perfil y órdenes | Frente C |

## Estructura

```
src/
├── api/          cliente HTTP y un módulo por recurso (hablan con el backend)
├── components/   Navbar, Footer, CourseCard, Campo, rutas protegidas...
├── context/      estado global: Auth, Cursos, Carrito, Compras, Usuarios
├── data/         datos de ejemplo y listas fijas (regiones, categorías)
├── hooks/        useFormulario
├── layouts/      PublicLayout, AuthLayout, AdminLayout
├── pages/        una página por ruta (admin/ para el panel)
├── styles/       estilos globales
├── utils/        validaciones, RUT, formatos y cálculo de pagos
├── test/         configuración de las pruebas
└── __tests__/    pruebas (formularios)
```

## Rutas

| Ruta | Acceso |
|---|---|
| `/`, `/cursos`, `/cursos/:id`, `/nosotros`, `/contacto`, `/carrito` | Público |
| `/login`, `/registro` | Público |
| `/checkout`, `/compra/exito/:id`, `/perfil` | Con sesión |
| `/admin`, `/admin/cursos`, `/admin/usuarios`, `/admin/ordenes` (y sus formularios) | Solo rol Admin |

## Convenciones

- Componentes y páginas en PascalCase, un componente por archivo.
- Los datos nunca se escriben a mano en una página: se leen del contexto (y, con la integración, de la API).
- Una rama por frente (`feature/cursos`, `feature/auth`, `feature/compras`), commits pequeños, Pull Request revisado por otra persona.
- No se suben claves ni el archivo `.env`.
