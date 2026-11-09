import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contacto from "../../pages/Contacto";

describe("Formulario de Contacto", () => {
  it("exige nombre y comentario, pero no el correo (es opcional)", async () => {
    const user = userEvent.setup();
    render(<Contacto />);

    await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    expect(screen.getByText("El nombre es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("El comentario es obligatorio.")).toBeInTheDocument();
    expect(screen.queryByText("El correo es obligatorio.")).not.toBeInTheDocument();
    expect(screen.queryByText(/Mensaje enviado/)).not.toBeInTheDocument();
  });

  it("valida el formato del correo si se escribe y actualiza el contador del comentario", async () => {
    const user = userEvent.setup();
    render(<Contacto />);

    await user.type(screen.getByLabelText("Correo (opcional)"), "correo-malo");
    expect(screen.getByText("Ingresa un correo válido (ej: nombre@dominio.com).")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Comentario"), "Hola!");
    expect(screen.getByText("5/500 caracteres.")).toBeInTheDocument();
  });

  it("con datos válidos confirma el envío y deja el formulario limpio", async () => {
    const user = userEvent.setup();
    render(<Contacto />);

    await user.type(screen.getByLabelText("Nombre completo"), "María González");
    await user.type(screen.getByLabelText("Comentario"), "¿Cuándo comienza el próximo curso?");
    await user.click(screen.getByRole("button", { name: "Enviar mensaje" }));

    expect(await screen.findByText(/Mensaje enviado/)).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre completo")).toHaveValue("");
    expect(screen.getByLabelText("Comentario")).toHaveValue("");
  });
});
