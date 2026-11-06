import { useState } from "react";

// Hook de formulario: maneja valores, "tocados" y envío.
// validar(valores) debe devolver un objeto { campo: "mensaje" | "" }.
export default function useFormulario(inicial, validar) {
  const [valores, setValores] = useState(inicial);
  const [tocados, setTocados] = useState({});
  const errores = validar(valores);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setValores((v) => ({ ...v, [name]: value }));
    setTocados((t) => ({ ...t, [name]: true }));
  };
  const salir = (e) => setTocados((t) => ({ ...t, [e.target.name]: true }));
  const errorDe = (campo) => (tocados[campo] ? errores[campo] : "");

  const enviar = (alValidar) => (e) => {
    e.preventDefault();
    const todos = Object.keys(inicial).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTocados(todos);
    if (Object.values(errores).every((m) => !m)) {
      alValidar(valores);
    } else {
      // lleva el foco al primer campo con error (igual que scrollIntoView en validaciones.js)
      setTimeout(() => document.querySelector(".is-invalid")?.focus(), 0);
    }
  };

  const reiniciar = () => { setValores(inicial); setTocados({}); };
  return { valores, setValores, cambiar, salir, errorDe, enviar, reiniciar };
}
