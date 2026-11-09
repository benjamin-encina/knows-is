import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Desmonta lo renderizado después de cada prueba para que no se contaminen entre sí
afterEach(() => cleanup());
