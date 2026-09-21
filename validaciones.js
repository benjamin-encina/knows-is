/* ============================================================
   Knows-IS — Validaciones de formularios
   Módulo: Administrador · Cursos (Nuevo curso / Editar curso)
 
   Reglas de validación tomadas de la planilla de requerimientos:
   - Código: requerido, texto, mínimo 3 caracteres.
   - Nombre: requerido, máximo 100 caracteres.
   - Descripción: opcional, máximo 500 caracteres.
   - Precio: requerido, numérico, mínimo 0 (permite decimales).
   - Cupos: requerido, entero, mínimo 0.
   - Cupo crítico: opcional, entero, mínimo 0.
     (Regla agregada por el equipo: no puede ser mayor que Cupos,
     ya que no tendría sentido alertar por un cupo crítico más alto
     que el total de cupos disponibles.)
   - Categoría / Nivel / Instructor: selección requerida.
   - Imagen: opcional; si se adjunta, debe ser un formato de imagen
     válido (jpg, jpeg, png, webp, gif).
   ============================================================ */
 
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formCurso");
  if (!form) return; // este script solo actúa si el formulario de curso existe en la página
 
  const alertOk = document.getElementById("cursoAlertOk");
 
  const EXTENSIONES_IMAGEN_VALIDAS = ["jpg", "jpeg", "png", "webp", "gif"];
 
  /* ---------- Helpers genéricos (reutilizables en otros formularios) ---------- */
 
  function mostrarError(input, mensaje) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    const feedback = document.getElementById("err-" + input.id);
    if (feedback) {
      feedback.textContent = mensaje;
      feedback.style.display = "block";
    }
  }
 
  function limpiarError(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    const feedback = document.getElementById("err-" + input.id);
    if (feedback) {
      feedback.textContent = "";
      feedback.style.display = "none";
    }
  }
 
  function esEntero(valor) {
    return /^-?\d+$/.test(String(valor).trim());
  }
 
  function esNumero(valor) {
    return valor !== "" && !isNaN(Number(valor));
  }
 
  /* ---------- Validadores por campo ---------- */
 
  function validarCodigo() {
    const input = document.getElementById("codigo");
    const valor = input.value.trim();
    if (valor === "") {
      mostrarError(input, "El código del curso es obligatorio.");
      return false;
    }
    if (!esEntero(valor)) {
      mostrarError(input, "El código del curso debe contener solo números.");
      return false;
    }
    if (valor.length < 5) {
      mostrarError(input, "El código debe tener al menos 5 dígitos.");
      return false;
    }
    limpiarError(input);
    return true;
  }
  function validarNombre() {
    const input = document.getElementById("nombre");
    const valor = input.value.trim();
    if (valor === "") {
      mostrarError(input, "El nombre del curso es obligatorio.");
      return false;
    }
    if (valor.length > 100) {
      mostrarError(input, "El nombre no puede superar los 100 caracteres.");
      return false;
    }
    limpiarError(input);
    return true;
  }
 
  function validarDescripcion() {
    const input = document.getElementById("descripcion");
    const valor = input.value.trim();
    // Campo opcional: solo se valida el largo máximo si se escribió algo.
    if (valor.length > 500) {
      mostrarError(input, "La descripción no puede superar los 500 caracteres.");
      return false;
    }
    limpiarError(input);
    return true;
  }
 
  function validarPrecio() {
    const input = document.getElementById("precio");
    const valor = input.value.trim();
    if (valor === "") {
      mostrarError(input, "Ingresa el precio del curso.");
      return false;
    }
    if (!esNumero(valor)) {
      mostrarError(input, "El precio debe ser un valor numérico.");
      return false;
    }
    if (Number(valor) < 0) {
      mostrarError(input, "El precio no puede ser negativo (usa 0 para un curso gratuito).");
      return false;
    }
    limpiarError(input);
    return true;
  }
 
  function validarCupos() {
    const input = document.getElementById("cupos");
    const valor = input.value.trim();
    if (valor === "") {
      mostrarError(input, "Ingresa la cantidad de cupos.");
      return false;
    }
    if (!esEntero(valor)) {
      mostrarError(input, "Los cupos deben ser un número entero (sin decimales).");
      return false;
    }
    if (Number(valor) < 25) {
      mostrarError(input, "Los cupos deben ser minimo 25");
      return false;
    }
    limpiarError(input);
    return true;
  }
 
  function validarCupoCritico() {
    const input = document.getElementById("cupo_critico");
    const cuposInput = document.getElementById("cupos");
    const valor = input.value.trim();
 
    // Campo opcional: si está vacío, es válido.
    if (valor === "") {
      limpiarError(input);
      return true;
    }
    if (!esEntero(valor)) {
      mostrarError(input, "El cupo crítico debe ser un número entero (sin decimales).");
      return false;
    }
    if (Number(valor) < 0) {
      mostrarError(input, "El cupo crítico no puede ser negativo.");
      return false;
    }
    const cuposValor = cuposInput.value.trim();
    if (esEntero(cuposValor) && Number(valor) > Number(cuposValor)) {
      mostrarError(input, "El cupo crítico no puede ser mayor que los cupos totales.");
      return false;
    }
    limpiarError(input);
    return true;
  }
 
  function validarSelect(id, etiqueta) {
    const input = document.getElementById(id);
    if (input.value === "") {
      mostrarError(input, "Selecciona " + etiqueta + ".");
      return false;
    }
    limpiarError(input);
    return true;
  }
 
  function validarImagen() {
    const input = document.getElementById("imagen");
    // Campo opcional: sin archivo seleccionado, es válido.
    if (!input.files || input.files.length === 0) {
      input.classList.remove("is-invalid", "is-valid");
      return true;
    }
    const nombreArchivo = input.files[0].name;
    const extension = nombreArchivo.split(".").pop().toLowerCase();
    if (!EXTENSIONES_IMAGEN_VALIDAS.includes(extension)) {
      mostrarError(input, "Formato no válido. Usa jpg, jpeg, png, webp o gif.");
      return false;
    }
    limpiarError(input);
    return true;
  }
 
  /* ---------- Validación en tiempo real ---------- */
 
  document.getElementById("codigo").addEventListener("input", validarCodigo);
  document.getElementById("nombre").addEventListener("input", validarNombre);
  document.getElementById("descripcion").addEventListener("input", validarDescripcion);
  document.getElementById("precio").addEventListener("input", validarPrecio);
  document.getElementById("cupos").addEventListener("input", function () {
    validarCupos();
    // Si ya se había escrito un cupo crítico, se revalida contra el nuevo total de cupos.
    if (document.getElementById("cupo_critico").value.trim() !== "") {
      validarCupoCritico();
    }
  });
  document.getElementById("cupo_critico").addEventListener("input", validarCupoCritico);
  document.getElementById("categoria").addEventListener("change", function () {
    validarSelect("categoria", "una categoría");
  });
  document.getElementById("nivel").addEventListener("change", function () {
    validarSelect("nivel", "un nivel");
  });
  document.getElementById("instructor").addEventListener("change", function () {
    validarSelect("instructor", "un instructor");
  });
  document.getElementById("imagen").addEventListener("change", validarImagen);
 
  /* ---------- Ocultar aviso de éxito al modificar el formulario ---------- */
  form.addEventListener("input", function () {
    alertOk.classList.add("d-none");
  });
  form.addEventListener("change", function () {
    alertOk.classList.add("d-none");
  });
 
  /* ---------- Validación al enviar el formulario ---------- */
 
  form.addEventListener("submit", function (evento) {
    evento.preventDefault(); // no hay backend conectado todavía
 
    const validaciones = [
      validarCodigo(),
      validarNombre(),
      validarDescripcion(),
      validarPrecio(),
      validarCupos(),
      validarCupoCritico(),
      validarSelect("categoria", "una categoría"),
      validarSelect("nivel", "un nivel"),
      validarSelect("instructor", "un instructor"),
      validarImagen(),
    ];
 
    const formularioValido = validaciones.every(Boolean);
 
    if (!formularioValido) {
      alertOk.classList.add("d-none");
      const primerCampoInvalido = form.querySelector(".is-invalid");
      if (primerCampoInvalido) {
        primerCampoInvalido.focus();
        primerCampoInvalido.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
 
    // Simulación de guardado exitoso (sin base de datos conectada aún).
    alertOk.classList.remove("d-none");
    alertOk.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});