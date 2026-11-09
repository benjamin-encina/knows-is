import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "../../pages/Login";

// Mocks: el contexto de autenticación y la navegación se reemplazan para aislar el formulario
const { loginMock, navigateMock } = vi.hoisted(() => ({ loginMock: vi.fn(), navigateMock: vi.fn() }));

vi.mock("../../context/AuthContext", () => ({ useAuth: () => ({ login: loginMock }) }));
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
}));

const renderLogin = () => render(<MemoryRouter><Login /></MemoryRouter>);

describe("Formulario de Login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra los errores de validación y no llama a login si se envía vacío", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Acceder" }));

    expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("con credenciales válidas llama a login y redirige según el rol", async () => {
    const user = userEvent.setup();
    loginMock.mockReturnValue({ ok: true, usuario: { rol: "Admin" } });
    renderLogin();

    await user.type(screen.getByLabelText("Correo"), "benjamin@knowsis.cl");
    await user.type(screen.getByLabelText("Contraseña"), "1234");
    await user.click(screen.getByRole("button", { name: "Acceder" }));

    expect(loginMock).toHaveBeenCalledWith("benjamin@knowsis.cl", "1234");
    expect(navigateMock).toHaveBeenCalledWith("/admin", { replace: true });
  });

  it("muestra el error general cuando las credenciales son incorrectas", async () => {
    const user = userEvent.setup();
    loginMock.mockReturnValue({ ok: false, error: "Correo o contraseña incorrectos." });
    renderLogin();

    await user.type(screen.getByLabelText("Correo"), "alumno@knowsis.cl");
    await user.type(screen.getByLabelText("Contraseña"), "9999");
    await user.click(screen.getByRole("button", { name: "Acceder" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos.");
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
