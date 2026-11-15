/* ============================================================================
   Cliente HTTP ÚNICO de la aplicación. Todas las llamadas al backend pasan por aquí.

   - Usa la URL del backend desde VITE_API_URL (archivo .env).
   - Envía y recibe JSON, y agrega "Authorization: Bearer <token>" cuando hay sesión.
   - Convierte cualquier error en un ErrorApi con el "mensaje" que manda el backend.
   - Si el servidor responde 401 con una sesión iniciada, intenta RENOVAR la sesión UNA vez
     y repite la petición. Si no se puede, avisa para cerrar la sesión.

   El frente de autenticación conecta la sesión real con configurarAuth() (ver más abajo).
   ============================================================================ */

export const URL_BASE = (import.meta.env?.VITE_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

/** Error de la API. estado = código HTTP (0 si no hubo conexión). */
export class ErrorApi extends Error {
  constructor(estado, mensaje, detalles = [], cuerpo = null) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
    this.detalles = detalles;
    this.cuerpo = cuerpo;
  }
}

// ---------------------------------------------------------------- conexión con la sesión
let auth = {
  obtenerToken: () => null,       // () => accessToken | null
  renovarSesion: null,            // async () => true si se renovó (guardó tokens nuevos), false si no
  alSesionExpirada: () => {},     // () => cerrar sesión localmente y mandar al login
};

/**
 * La conecta el AuthContext al iniciar la app:
 *   configurarAuth({ obtenerToken, renovarSesion, alSesionExpirada })
 */
export function configurarAuth(nueva) {
  auth = { ...auth, ...nueva };
}

// Si varias peticiones reciben 401 a la vez, se renueva la sesión UNA sola vez y todas esperan el resultado
let renovando = null;
function renovarUnaVez() {
  if (!renovando) {
    renovando = Promise.resolve()
      .then(() => auth.renovarSesion())
      .then((ok) => Boolean(ok), () => false)
      .finally(() => { renovando = null; });
  }
  return renovando;
}

// ---------------------------------------------------------------- utilidades
function construirUrl(ruta, params) {
  const url = new URL(URL_BASE + ruta);
  if (params) {
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== "") url.searchParams.set(clave, valor);
    });
  }
  return url.toString();
}

async function leerCuerpo(respuesta) {
  if (respuesta.status === 204) return null;
  const texto = await respuesta.text();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

function mensajePorEstado(estado) {
  const mensajes = {
    400: "La solicitud tiene datos inválidos.",
    401: "Tu sesión expiró o no has iniciado sesión.",
    403: "No tienes permiso para realizar esta acción.",
    404: "No se encontró lo que buscas.",
    409: "La operación choca con el estado actual de los datos.",
    422: "No se pudo procesar la solicitud.",
    500: "Error interno del servidor. Intenta nuevamente.",
  };
  return mensajes[estado] ?? `Error ${estado}`;
}

// ---------------------------------------------------------------- petición base
async function enviar(metodo, ruta, { body, params, auth: usarAuth = true, reintentar = true } = {}) {
  const encabezados = { Accept: "application/json" };
  if (body !== undefined) encabezados["Content-Type"] = "application/json";

  const token = usarAuth ? auth.obtenerToken() : null;
  if (token) encabezados.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(construirUrl(ruta, params), {
      method: metodo,
      headers: encabezados,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ErrorApi(0, "No se pudo conectar con el servidor. Revisa tu conexión o intenta más tarde.");
  }

  // Token vencido: renovar la sesión una vez y repetir la petición
  if (respuesta.status === 401 && usarAuth && token && reintentar && auth.renovarSesion) {
    if (await renovarUnaVez()) {
      return enviar(metodo, ruta, { body, params, auth: usarAuth, reintentar: false });
    }
    auth.alSesionExpirada();
  }

  const datos = await leerCuerpo(respuesta);
  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, datos?.mensaje ?? mensajePorEstado(respuesta.status), datos?.detalles ?? [], datos);
  }
  return datos;
}

/**
 * Opciones de cada llamada:  { params, auth }
 *   params → parámetros de la URL (?categoria=redes). Los vacíos se omiten.
 *   auth   → false para rutas públicas (login, listar cursos...): no se envía el token.
 */
export const api = {
  get: (ruta, opciones) => enviar("GET", ruta, opciones),
  post: (ruta, body, opciones) => enviar("POST", ruta, { ...opciones, body }),
  put: (ruta, body, opciones) => enviar("PUT", ruta, { ...opciones, body }),
  patch: (ruta, body, opciones) => enviar("PATCH", ruta, { ...opciones, body }),
  delete: (ruta, opciones) => enviar("DELETE", ruta, opciones),
};
