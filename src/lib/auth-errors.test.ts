import { describe, expect, it } from "vitest";
import { translateAuthError } from "./auth-errors";

describe("translateAuthError", () => {
  it("maps invalid credentials", () => {
    expect(translateAuthError("Invalid login credentials")).toBe("Correo o contraseña incorrectos.");
  });

  it("maps duplicate signup", () => {
    expect(translateAuthError("User already registered")).toBe("Ese correo ya está registrado.");
  });

  it("keeps unknown messages", () => {
    expect(translateAuthError("weird backend thing")).toBe("weird backend thing");
  });
});
