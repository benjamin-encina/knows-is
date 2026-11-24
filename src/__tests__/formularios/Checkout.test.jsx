import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Checkout from "../../pages/Checkout";
import { ComprasProvider } from "../../context/ComprasContext";
import { ErrorApi } from "../../api/client";
import { crearOrden, listarMisOrdenes } from "../../api/ordenesApi";

// Se usa el ComprasProvider REAL y se simula la API de órdenes (ordenesApi):
// así se prueba que el Checkout envía la compra al backend y muestra lo que este responde.
const { navigateMock, vaciarMock, recargarCursosMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  vaciarMock: vi.fn(),
  recargarCursosMock: vi.fn(),
}));

const CURSO = {
  id: 1, codigo: "10001", nombre: "JavaScript desde cero", precio: 210000, instructor: "Kevin Soto",
  categoria: "programacion", cupos: 30, cuposOcupados: 0, cuposDisponibles: 30,
};
// sin nombre ni correo, para que el formulario parta vacío
const USUARIO = { id: 4, rol: "Alumno" };

vi.mock("../../api/ordenesApi", () => ({
  crearOrden: vi.fn(),
  listarMisOrdenes: vi.fn(),
  listarOrdenes: vi.fn(),
  obtenerOrden: vi.fn(),
  anularOrden: vi.fn(),
  obtenerResumenCupos: vi.fn(),
}));
vi.mock("../../context/AuthContext", () => ({ useAuth: () => ({ usuario: USUARIO }) }));
vi.mock("../../context/CarritoContext", () => ({
  useCarrito: () => ({ items: [CURSO], total: CURSO.precio, vaciar: vaciarMock }),
}));
vi.mock("../../context/CursosContext", () => ({
  useCursos: () => ({ obtenerCurso: (id) => (String(id) === "1" ? CURSO : undefined), recargar: recargarCursosMock }),
}));
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
}));

// vencimiento siempre vigente, sin depender de la fecha actual
const anioFuturo = String((new Date().getFullYear() + 2) % 100).padStart(2, "0");

const renderCheckout = () =>
  render(
    <MemoryRouter>
      <ComprasProvider>
        <Checkout />
      </ComprasProvider>
    </MemoryRouter>
  );
const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
// el botón de pago está fuera del <form> (atributo form=), así que se envía el formulario directamente
const enviar = (container) => fireEvent.submit(container.querySelector("#form-checkout"));

function llenarFormularioValido() {
  escribir("Nombre completo", "Ana Pérez");
  escribir("RUT", "123456785");
  escribir("Correo", "ana@correo.cl");
  escribir("Dirección", "Calle 1, Santiago");
  escribir("Número de tarjeta", "4242424242424242");
  escribir("Nombre del titular", "ANA PEREZ");
  escribir("Vencimiento", `12${anioFuturo}`);
  escribir("CVV", "123");
}

// Orden tal como la devuelve el backend (contrato): el total oficial lo calcula el servidor
const ORDEN = {
  id: "KS-00001", usuarioId: 4, fecha: "2026-11-20T15:30:00Z",
  items: [{ cursoId: 1, codigo: "10001", nombre: "JavaScript desde cero", instructor: "Kevin Soto", categoria: "programacion", precio: 210000 }],
  subtotal: 210000, descuento: 14000, total: 196000, cuotas: 3, primeraCuota: 56000, valorCuota: 70000,
  facturacion: { nombre: "Ana Pérez", rut: "12.345.678-5", correo: "ana@correo.cl", telefono: "", direccion: "Calle 1, Santiago" },
  pago: { medio: "Tarjeta •••• 4242", referencia: "PAY-TEST" }, estado: "Pagada",
};

describe("Formulario de Checkout (conectado a ordenesApi)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listarMisOrdenes.mockResolvedValue([]);
  });

  it("muestra los errores de facturación y de tarjeta al enviar vacío, sin llamar al backend", () => {
    const { container } = renderCheckout();

    enviar(container);

    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El RUT es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El número de tarjeta es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("Usa el formato MM/AA (ej: 08/28).")).toBeInTheDocument();
    expect(screen.getByText("El CVV debe tener 3 o 4 dígitos.")).toBeInTheDocument();
    expect(crearOrden).not.toHaveBeenCalled();
  });

  it("si el servidor rechaza el pago (422) muestra su mensaje, no vacía el carrito ni navega", async () => {
    crearOrden.mockRejectedValue(new ErrorApi(422, "El banco rechazó el pago. Prueba con otra tarjeta."));
    const { container } = renderCheckout();

    llenarFormularioValido();
    escribir("Número de tarjeta", "4000000000000002");
    enviar(container);

    expect(await screen.findByText("El banco rechazó el pago. Prueba con otra tarjeta.")).toBeInTheDocument();
    expect(crearOrden).toHaveBeenCalledTimes(1);
    expect(vaciarMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("si el alumno ya está inscrito (409) muestra el mensaje del servidor", async () => {
    crearOrden.mockRejectedValue(new ErrorApi(409, "Ya estás inscrito en el curso JavaScript desde cero"));
    const { container } = renderCheckout();

    llenarFormularioValido();
    enviar(container);

    expect(await screen.findByText("Ya estás inscrito en el curso JavaScript desde cero")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("avisa antes de pagar si el curso ya figura en mis órdenes pagadas", async () => {
    listarMisOrdenes.mockResolvedValue([ORDEN]);
    const { container } = renderCheckout();
    await waitFor(() => expect(listarMisOrdenes).toHaveBeenCalled());

    llenarFormularioValido();
    enviar(container);

    expect(await screen.findByText("JavaScript desde cero: Ya estás inscrito en este curso.")).toBeInTheDocument();
    expect(crearOrden).not.toHaveBeenCalled();
  });

  it("aplica las máscaras, envía la compra al backend sin precios y navega al éxito con el número de la orden", async () => {
    crearOrden.mockResolvedValue(ORDEN);
    const { container } = renderCheckout();

    llenarFormularioValido();
    escribir("Forma de pago", "3");

    // máscaras: RUT con puntos y guion, tarjeta en grupos de 4 y vencimiento MM/AA
    expect(screen.getByLabelText("RUT")).toHaveValue("12.345.678-5");
    expect(screen.getByLabelText("Número de tarjeta")).toHaveValue("4242 4242 4242 4242");
    expect(screen.getByLabelText("Vencimiento")).toHaveValue(`12/${anioFuturo}`);

    enviar(container);

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/compra/exito/KS-00001", { replace: true }));
    expect(crearOrden).toHaveBeenCalledWith({
      cursoIds: [1],
      cuotas: 3,
      facturacion: { nombre: "Ana Pérez", rut: "12.345.678-5", correo: "ana@correo.cl", telefono: "", direccion: "Calle 1, Santiago" },
      tarjeta: { numero: "4242 4242 4242 4242", titular: "ANA PEREZ", vencimiento: `12/${anioFuturo}`, cvv: "123" },
    });
    // el cliente no manda precio ni total: los calcula el servidor
    expect(crearOrden.mock.calls[0][0]).not.toHaveProperty("total");
    expect(vaciarMock).toHaveBeenCalled();
    expect(recargarCursosMock).toHaveBeenCalled();
  });
});
