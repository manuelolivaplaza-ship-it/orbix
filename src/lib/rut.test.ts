import { describe, expect, it } from "vitest";
import {
  compactRut,
  computeRutDv,
  formatRut,
  GENERIC_BOLETA_RUT,
  isValidRut,
  siiRut,
} from "./rut";

describe("Chilean RUT", () => {
  it("computes módulo 11 including K and the generic boleta RUT", () => {
    expect(computeRutDv("11111111")).toBe("1");
    expect(isValidRut("11.111.111-1")).toBe(true);
    expect(isValidRut(GENERIC_BOLETA_RUT)).toBe(true);
    expect(isValidRut("76.543.210-3")).toBe(true);
    expect(isValidRut("76.543.210-K")).toBe(false);
    expect(isValidRut("123")).toBe(false);
  });

  it("formats and compacts for SII XML", () => {
    expect(formatRut("761111111")).toBe("76.111.111-1");
    expect(compactRut("76.111.111-1")).toBe("761111111");
    expect(siiRut("76.111.111-1")).toBe("76111111-1");
  });
});
