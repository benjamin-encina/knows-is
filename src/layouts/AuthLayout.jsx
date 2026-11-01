import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Login y registro: navbar + footer compacto (igual que en la versión HTML)
export default function AuthLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer compacto />
    </>
  );
}
