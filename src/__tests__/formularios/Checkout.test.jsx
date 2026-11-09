import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Checkout from "../../pages/Checkout";
import { procesarPago } from "../../utils/pagos";

// Mocks: contextos, navegación y la pasarela de pago (en la app real tarda 1,5 s)
const { navigateMock, validarCarritoMock, confirmarCompraMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  validarCarritoMock: vi.fn(),
  confirmarCompraMock: vi.fn(),
}));

const CURSO = { id: 1, nombre: "JavaScript desde cero", precio: 210000 };

vi.mock("../../context/AuthContext", () => ({ useAuth: () => ({ usuario: null }) }));
vi.mock("../../context/CarritoContext", () => ({ useCarrito: () => ({ items: [CURSO], total: CURSO.precio }) }));
vi.mock("../../context/ComprasContext", () => ({
  useCompras: () => ({ validarCarrito: validarCarritoMock, confirmarCompra: confirmarCompraMock }),
}));
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
}));
// Solo se reemplaza procesarPago; Luhn, formatos y planes de pago siguen siendo los reales
vi.mock("../../utils/pagos", async (importOriginal) => ({
  ...(await importOriginal()),
  procesarPago: vi.fn(),
}));

// vencimiento siempre vigente, sin depender de la fecha actual
const anioFuturo = String((new Date().getFullYear() + 2) % 100).padStart(2, "0");

const renderCheckout = () => render(<MemoryRouter><Checkout /></MemoryRouter>);
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

describe("Formulario de Checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validarCarritoMock.mockReturnValue("");
  });

  it("muestra los errores de facturación y de tarjeta al enviar vacío, sin cobrar", () => {
    const { container } = renderCheckout();

    enviar(container);

    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El RUT es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El número de tarjeta es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("Usa el formato MM/AA (ej: 08/28).")).toBeInTheDocument();
    expect(screen.getByText("El CVV debe tener 3 o 4 dígitos.")).toBeInTheDocument();
    expect(procesarPago).not.toHaveBeenCalled();
  });

  it("si el banco rechaza la tarjeta muestra el error y no confirma la compra", async () => {
    procesarPago.mockResolvedValue({ ok: false, error: "El banco rechazó el pago. Prueba con otra tarjeta." });
    const { container } = renderCheckout();

    llenarFormularioValido();
    escribir("Número de tarjeta", "4000000000000002");
    enviar(container);

    expect(await screen.findByText("El banco rechazó el pago. Prueba con otra tarjeta.")).toBeInTheDocument();
    expect(confirmarCompraMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("aplica las máscaras de formato y, con pago aprobado, confirma la compra y navega al éxito", async () => {
    procesarPago.mockResolvedValue({ ok: true, referencia: "PAY-TEST" });
    confirmarCompraMock.mockReturnValue({ ok: true, orden: { id: "ORD-1" } });
    const { container } = renderCheckout();

    llenarFormularioValido();

    // máscaras: RUT con puntos y guion, tarjeta en grupos de 4 y vencimiento MM/AA
    expect(screen.getByLabelText("RUT")).toHaveValue("12.345.678-5");
    expect(screen.getByLabelText("Número de tarjeta")).toHaveValue("4242 4242 4242 4242");
    expect(screen.getByLabelText("Vencimiento")).toHaveValue(`12/${anioFuturo}`);

    enviar(container);

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/compra/exito/ORD-1", { replace: true }));
    expect(procesarPago).toHaveBeenCalledWith({ numero: "4242 4242 4242 4242" });
    expect(confirmarCompraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cuotas: 1,
        pago: { medio: "Tarjeta •••• 4242", referencia: "PAY-TEST" },
        facturacion: expect.objectContaining({ nombre: "Ana Pérez", rut: "12.345.678-5", correo: "ana@correo.cl" }),
      })
    );
  });
});
