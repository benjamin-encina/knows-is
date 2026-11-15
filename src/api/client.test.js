import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorApi, URL_BASE, api, configurarAuth } from "./client";

// Respuesta falsa del servidor (solo lo que usa el cliente: ok, status y text())
const respuesta = (estado, cuerpo) => ({
  ok: estado >= 200 && estado < 300,
  status: estado,
  text: async () => (cuerpo === undefined ? "" : JSON.stringify(cuerpo)),
});

const fetchOriginal = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = vi.fn(); // mock de fetch: nunca se llama al servidor real
  configurarAuth({ obtenerToken: () => null, renovarSesion: null, alSesionExpirada: () => {} });
});

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

describe("api (cliente HTTP): armado de la petición", () => {
  it("arma la URL con la base y los parámetros, omitiendo los vacíos", async () => {
    fetch.mockResolvedValue(respuesta(200, []));

    await api.get("/api/cursos", { params: { categoria: "redes", nivel: "", q: undefined }, auth: false });

    expect(fetch.mock.calls[0][0]).toBe(`${URL_BASE}/api/cursos?categoria=redes`);
  });

  it("envía el cuerpo como JSON", async () => {
    fetch.mockResolvedValue(respuesta(201, { id: 1 }));

    await api.post("/api/cursos", { nombre: "JavaScript" });

    const [, opciones] = fetch.mock.calls[0];
    expect(opciones.method).toBe("POST");
    expect(opciones.headers["Content-Type"]).toBe("application/json");
    expect(opciones.body).toBe('{"nombre":"JavaScript"}');
  });

  it("agrega el encabezado Authorization cuando hay sesión", async () => {
    configurarAuth({ obtenerToken: () => "abc123" });
    fetch.mockResolvedValue(respuesta(200, {}));

    await api.get("/api/auth/me");

    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer abc123");
  });

  it("no envía el token en las rutas públicas (auth: false)", async () => {
    configurarAuth({ obtenerToken: () => "abc123" });
    fetch.mockResolvedValue(respuesta(200, {}));

    await api.get("/api/cursos", { auth: false });

    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
});

describe("api (cliente HTTP): respuestas y errores", () => {
  it("devuelve null cuando el servidor responde 204 sin contenido", async () => {
    fetch.mockResolvedValue(respuesta(204));

    expect(await api.delete("/api/cursos/1")).toBeNull();
  });

  it("convierte un error del backend en un ErrorApi con su mensaje y detalles", async () => {
    fetch.mockResolvedValue(respuesta(400, { mensaje: "Hay datos inválidos", detalles: ["codigo: no puede estar vacío"] }));

    const error = await api.post("/api/cursos", {}).catch((e) => e);

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.estado).toBe(400);
    expect(error.message).toBe("Hay datos inválidos");
    expect(error.detalles).toEqual(["codigo: no puede estar vacío"]);
  });

  it("usa un mensaje por defecto si el servidor no manda ninguno", async () => {
    fetch.mockResolvedValue(respuesta(403));

    const error = await api.get("/api/usuarios").catch((e) => e);

    expect(error.estado).toBe(403);
    expect(error.message).toContain("permiso");
  });

  it("traduce una caída de red a un ErrorApi con estado 0", async () => {
    fetch.mockRejectedValue(new TypeError("fetch failed"));

    const error = await api.get("/api/cursos", { auth: false }).catch((e) => e);

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.estado).toBe(0);
    expect(error.message).toContain("conectar");
  });
});

describe("api (cliente HTTP): renovación de la sesión", () => {
  it("con un 401 renueva la sesión una vez y repite la petición con el token nuevo", async () => {
    let token = "viejo";
    const renovarSesion = vi.fn(async () => { token = "nuevo"; return true; });
    const alSesionExpirada = vi.fn();
    configurarAuth({ obtenerToken: () => token, renovarSesion, alSesionExpirada });
    fetch.mockResolvedValueOnce(respuesta(401, { mensaje: "Token vencido" })).mockResolvedValueOnce(respuesta(200, { ok: true }));

    const datos = await api.get("/api/ordenes/mias");

    expect(datos).toEqual({ ok: true });
    expect(renovarSesion).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe("Bearer nuevo");
    expect(alSesionExpirada).not.toHaveBeenCalled();
  });

  it("si no se puede renovar, avisa que la sesión expiró y lanza el 401", async () => {
    const alSesionExpirada = vi.fn();
    configurarAuth({ obtenerToken: () => "viejo", renovarSesion: vi.fn(async () => false), alSesionExpirada });
    fetch.mockResolvedValue(respuesta(401, { mensaje: "Token vencido" }));

    const error = await api.get("/api/ordenes/mias").catch((e) => e);

    expect(error.estado).toBe(401);
    expect(alSesionExpirada).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("no reintenta más de una vez aunque el servidor siga respondiendo 401", async () => {
    const renovarSesion = vi.fn(async () => true);
    configurarAuth({ obtenerToken: () => "viejo", renovarSesion, alSesionExpirada: vi.fn() });
    fetch.mockResolvedValue(respuesta(401, { mensaje: "No autorizado" }));

    const error = await api.get("/api/ordenes/mias").catch((e) => e);

    expect(error.estado).toBe(401);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(renovarSesion).toHaveBeenCalledTimes(1);
  });

  it("varias peticiones con 401 a la vez comparten una sola renovación", async () => {
    let token = "viejo";
    const renovarSesion = vi.fn(async () => {
      await new Promise((resolver) => setTimeout(resolver, 10));
      token = "nuevo";
      return true;
    });
    configurarAuth({ obtenerToken: () => token, renovarSesion, alSesionExpirada: vi.fn() });
    fetch.mockImplementation(async (url, opciones) =>
      opciones.headers.Authorization === "Bearer viejo" ? respuesta(401, {}) : respuesta(200, { ok: true }));

    const resultados = await Promise.all([api.get("/api/a"), api.get("/api/b"), api.get("/api/c")]);

    expect(resultados).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(renovarSesion).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(6);
  });

  it("no intenta renovar si la petición no llevaba token (por ejemplo, un login incorrecto)", async () => {
    const renovarSesion = vi.fn(async () => true);
    configurarAuth({ obtenerToken: () => null, renovarSesion, alSesionExpirada: vi.fn() });
    fetch.mockResolvedValue(respuesta(401, { mensaje: "Correo o contraseña incorrectos" }));

    const error = await api.post("/api/auth/login", { correo: "a@b.cl", contrasena: "x" }, { auth: false }).catch((e) => e);

    expect(error.message).toBe("Correo o contraseña incorrectos");
    expect(renovarSesion).not.toHaveBeenCalled();
  });
});
