import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Registro from "../../pages/Registro";

const { registrarMock, navigateMock } = vi.hoisted(() => ({ registrarMock: vi.fn(), navigateMock: vi.fn() }));

vi.mock("../../context/AuthContext", () => ({ useAuth: () => ({ registrar: registrarMock }) }));
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
}));

const renderRegistro = () => render(<MemoryRouter><Registro /></MemoryRouter>);

describe("Formulario de Registro", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra los errores de los campos obligatorios al enviar vacío", async () => {
    const user = userEvent.setup();
    renderRegistro();

    await user.click(screen.getByRole("button", { name: "Registrarme" }));

    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("Los apellidos es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("Selecciona una región.")).toBeInTheDocument();
    expect(registrarMock).not.toHaveBeenCalled();
  });

  it("valida la fortaleza de la contraseña y que la confirmación coincida", async () => {
    const user = userEvent.setup();
    renderRegistro();

    await user.type(screen.getByLabelText("Contraseña"), "abc");
    expect(screen.getByText("La contraseña debe tener al menos 8 caracteres.")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Contraseña"));
    await user.type(screen.getByLabelText("Contraseña"), "abcdefgh");
    expect(screen.getByText(/Debe incluir una mayúscula/)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Confirmar contraseña"), "otraClave");
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
  });

  it("habilita las comunas según la región y registra al usuario con datos válidos", async () => {
    const user = userEvent.setup();
    registrarMock.mockReturnValue({ ok: true });
    renderRegistro();

    // la comuna depende de la región elegida
    expect(screen.getByLabelText("Comuna")).toBeDisabled();
    await user.selectOptions(screen.getByLabelText("Región"), "Región de Ñuble");
    expect(screen.getByLabelText("Comuna")).toBeEnabled();
    expect(screen.getByRole("option", { name: "Chillán" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Comuna"), "Chillán");

    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Apellidos"), "Pérez Soto");
    await user.type(screen.getByLabelText("Correo"), "ana@knowsis.cl");
    await user.type(screen.getByLabelText("Contraseña"), "Abcd123#");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "Abcd123#");
    await user.type(screen.getByLabelText("Dirección"), "Calle Falsa 123");
    await user.click(screen.getByRole("button", { name: "Registrarme" }));

    expect(registrarMock).toHaveBeenCalledWith({
      nombre: "Ana Pérez Soto",
      apellidos: "Pérez Soto",
      correo: "ana@knowsis.cl",
      contrasena: "Abcd123#",
      telefono: "",
      region: "Región de Ñuble",
      comuna: "Chillán",
      direccion: "Calle Falsa 123",
    });
    expect(navigateMock).toHaveBeenCalledWith("/login", { state: { registrado: true } });
  });
});
