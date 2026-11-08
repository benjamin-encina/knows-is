import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import RutaAdmin from "./components/RutaAdmin";
import RutaUsuario from "./components/RutaUsuario";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Cursos from "./pages/Cursos";
import CursoDetalle from "./pages/CursoDetalle";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import CompraExitosa from "./pages/CompraExitosa";
import Perfil from "./pages/Perfil";
import NoEncontrada from "./pages/NoEncontrada";

import AdminHome from "./pages/admin/AdminHome";
import AdminCursos from "./pages/admin/AdminCursos";
import AdminCursoForm from "./pages/admin/AdminCursoForm";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminOrdenes from "./pages/admin/AdminOrdenes";
import AdminUsuarioForm from "./pages/admin/AdminUsuarioForm";

export default function App() {
  return (
    <Routes>
      {/* Sitio público */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/cursos/:id" element={<CursoDetalle />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/carrito" element={<Carrito />} />

        {/* Requieren sesión: sin ella llevan a /login y luego vuelven aquí */}
        <Route element={<RutaUsuario />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compra/exito/:id" element={<CompraExitosa />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/mis-cursos" element={<Navigate to="/perfil" replace />} />
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Route>

      {/* Login y registro (footer compacto) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>

      {/* Panel de administrador (protegido: solo rol Admin) */}
      <Route element={<RutaAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="cursos" element={<AdminCursos />} />
          <Route path="cursos/nuevo" element={<AdminCursoForm />} />
          <Route path="cursos/:id/editar" element={<AdminCursoForm />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="usuarios/nuevo" element={<AdminUsuarioForm />} />
          <Route path="usuarios/:id/editar" element={<AdminUsuarioForm />} />
          <Route path="ordenes" element={<AdminOrdenes />} />
        </Route>
      </Route>
    </Routes>
  );
}