import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminUsuarioForm from "../../pages/admin/AdminUsuarioForm";

const { crearUsuarioMock, editarUsuarioMock, navigateMock } = vi.hoisted(() => ({
  crearUsuarioMock: vi.fn(),
  editarUsuarioMock: vi.fn(),
  navigateMock: vi.fn(),
}));

const USUARIOS = [
  { id: 1, nombre: "Benjamín Encina", correo: "benjamin@knowsis.cl", rol: "Admin", estado: "Activo" },
];

vi.mock("../../context/UsuarioContext", () => ({
  useUsuarios: () => ({
    usuarios: USUARIOS,
    obtenerUsuario: (id) => USUARIOS.find((u) => String(u.id) === String(id)),
    crearUsuario: crearUsuarioMock,
    editarUsuario: editarUsuarioMock,
  }),
}));
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
}));

const renderFormulario = (ruta = "/admin/usuarios/nuevo") =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/admin/usuarios/nuevo" element={<AdminUsuarioForm />} />
        <Route path="/admin/usuarios/:id/editar" element={<AdminUsuarioForm />} />
      </Routes>
    </MemoryRouter>
  );

describe("Formulario de Usuario (admin)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra los errores de los campos obligatorios al guardar vacío", async () => {
    const user = userEvent.setup();
    renderFormulario();

    await user.click(screen.getByRole("button", { name: "Guardar usuario" }));

    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
    expect(screen.getByText("Selecciona un rol.")).toBeInTheDocument();
    expect(crearUsuarioMock).not.toHaveBeenCalled();
  });

  it("con datos válidos crea el usuario y vuelve al listado con un mensaje", async () => {
    const user = userEvent.setup();
    renderFormulario();

    await user.type(screen.getByLabelText("Nombre completo"), "Nuevo Usuario");
    await user.type(screen.getByLabelText("Correo"), "nuevo@knowsis.cl");
    await user.type(screen.getByLabelText("Contraseña"), "Abcd123#");
    await user.selectOptions(screen.getByLabelText("Rol"), "Alumno");
    await user.click(screen.getByRole("button", { name: "Guardar usuario" }));

    expect(crearUsuarioMock).toHaveBeenCalledWith({
      nombre: "Nuevo Usuario",
      correo: "nuevo@knowsis.cl",
      telefono: "",
      rol: "Alumno",
      estado: "Activo",
      contrasena: "Abcd123#",
    });
    expect(navigateMock).toHaveBeenCalledWith("/admin/usuarios", {
      state: { mensaje: "Usuario creado correctamente." },
    });
  });

  it("al editar precarga los datos y, con la contraseña vacía, no la envía", async () => {
    const user = userEvent.setup();
    renderFormulario("/admin/usuarios/1/editar");

    expect(screen.getByLabelText("Nombre completo")).toHaveValue("Benjamín Encina");
    expect(screen.getByLabelText("Correo")).toHaveValue("benjamin@knowsis.cl");

    await user.click(screen.getByRole("button", { name: "Guardar usuario" }));

    expect(editarUsuarioMock).toHaveBeenCalledWith(1, {
      nombre: "Benjamín Encina",
      correo: "benjamin@knowsis.cl",
      telefono: "",
      rol: "Admin",
      estado: "Activo",
    });
    expect(navigateMock).toHaveBeenCalledWith("/admin/usuarios", {
      state: { mensaje: "Usuario actualizado correctamente." },
    });
  });
});
