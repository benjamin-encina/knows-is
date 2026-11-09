import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminCursoForm from "../../pages/admin/AdminCursoForm";

const { crearCursoMock, editarCursoMock, navigateMock } = vi.hoisted(() => ({
  crearCursoMock: vi.fn(),
  editarCursoMock: vi.fn(),
  navigateMock: vi.fn(),
}));

const CURSOS = [{ id: 1, codigo: "10001", nombre: "JavaScript desde cero", precio: 210000, cupos: 30 }];

vi.mock("../../context/CursosContext", () => ({
  useCursos: () => ({
    cursos: CURSOS,
    obtenerCurso: (id) => CURSOS.find((c) => String(c.id) === String(id)),
    crearCurso: crearCursoMock,
    editarCurso: editarCursoMock,
  }),
}));
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => navigateMock,
}));

const renderFormulario = () =>
  render(
    <MemoryRouter initialEntries={["/admin/cursos/nuevo"]}>
      <Routes><Route path="/admin/cursos/nuevo" element={<AdminCursoForm />} /></Routes>
    </MemoryRouter>
  );

describe("Formulario de Curso (admin)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra los errores de los campos obligatorios al guardar vacío", async () => {
    const user = userEvent.setup();
    renderFormulario();

    await user.click(screen.getByRole("button", { name: "Guardar curso" }));

    expect(screen.getByText("El código del curso es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El nombre del curso es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("Ingresa el precio del curso.")).toBeInTheDocument();
    expect(screen.getByText("Ingresa la cantidad de cupos.")).toBeInTheDocument();
    expect(screen.getByText("Selecciona una categoría.")).toBeInTheDocument();
    expect(crearCursoMock).not.toHaveBeenCalled();
  });

  it("rechaza un código repetido y un cupo crítico mayor que los cupos totales", async () => {
    const user = userEvent.setup();
    renderFormulario();

    await user.type(screen.getByLabelText("Código del curso"), "10001");
    expect(screen.getByText("Ya existe un curso con ese código.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Cupos"), "10");
    await user.type(screen.getByLabelText(/^Cupo crítico/), "20");
    expect(screen.getByText("El cupo crítico no puede ser mayor que los cupos totales.")).toBeInTheDocument();
  });

  it("con datos válidos crea el curso y vuelve al listado con un mensaje", async () => {
    const user = userEvent.setup();
    renderFormulario();

    await user.type(screen.getByLabelText("Código del curso"), "CUR-900");
    await user.type(screen.getByLabelText("Nombre"), "Curso de prueba");
    await user.type(screen.getByLabelText("Precio ($)"), "50000");
    await user.type(screen.getByLabelText("Cupos"), "20");
    await user.selectOptions(screen.getByLabelText("Categoría"), "redes");
    await user.selectOptions(screen.getByLabelText("Nivel"), "Inicial");
    await user.selectOptions(screen.getByLabelText("Instructor"), "Kevin Soto");
    await user.click(screen.getByRole("button", { name: "Guardar curso" }));

    expect(crearCursoMock).toHaveBeenCalledWith({
      codigo: "CUR-900",
      nombre: "Curso de prueba",
      descripcion: "",
      precio: 50000,
      cupos: 20,
      cupoCritico: null,
      categoria: "redes",
      nivel: "Inicial",
      instructor: "Kevin Soto",
    });
    expect(navigateMock).toHaveBeenCalledWith("/admin/cursos", {
      state: { mensaje: "Curso creado correctamente." },
    });
  });
});
