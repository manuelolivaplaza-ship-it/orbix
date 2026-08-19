import { describe, expect, it } from "vitest";
import {
  computeFiniquito,
  computeLiquidacion,
  DEFAULT_AFP_RATE,
  DEFAULT_SALUD_RATE,
  defaultExtrasForSalary,
  previredRows,
  yearsOfService,
} from "./payroll";
import { EMPLOYEES } from "./seed";

describe("liquidación haberes, descuentos and líquido", () => {
  it("builds haberes and descuentos from employee pay and returns líquido", () => {
    const breakdown = computeLiquidacion({
      sueldoBase: 1_000_000,
      horasExtra: 100_000,
      bono: 50_000,
      colacion: 40_000,
      movilizacion: 30_000,
      afpRate: 0.1,
      saludRate: 0.07,
      impuestoUnico: 20_000,
    });

    expect(breakdown.haberes.map((h) => h.name)).toEqual([
      "Sueldo base",
      "Horas extra",
      "Bono",
      "Colación",
      "Movilización",
    ]);
    expect(breakdown.totalHaberes).toBe(1_220_000);
    expect(breakdown.imponible).toBe(1_150_000);
    expect(breakdown.descuentos.find((d) => d.name === "AFP")?.amount).toBe(115_000);
    expect(breakdown.descuentos.find((d) => d.name === "Salud (7%)")?.amount).toBe(80_500);
    expect(breakdown.liquido).toBe(
      breakdown.totalHaberes - breakdown.totalDescuentos,
    );
  });

  it("uses the same function as payroll generation on a seeded employee", () => {
    const employee = EMPLOYEES[0];
    const extras = defaultExtrasForSalary(employee.sueldoBase);
    const breakdown = computeLiquidacion({ sueldoBase: employee.sueldoBase, ...extras });
    const expectedImponible =
      employee.sueldoBase + (extras.horasExtra ?? 0) + (extras.bono ?? 0);
    expect(breakdown.imponible).toBe(expectedImponible);
    expect(breakdown.descuentos.find((d) => d.name === "AFP")?.amount).toBe(
      Math.round(expectedImponible * DEFAULT_AFP_RATE),
    );
    expect(breakdown.descuentos.find((d) => d.name === "Salud (7%)")?.amount).toBe(
      Math.round(expectedImponible * DEFAULT_SALUD_RATE),
    );
    expect(breakdown.liquido).toBe(breakdown.totalHaberes - breakdown.totalDescuentos);
    expect(breakdown.liquido).toBeLessThan(breakdown.totalHaberes);
    expect(breakdown.haberes[0]).toEqual({ name: "Sueldo base", amount: employee.sueldoBase });
  });

  it("computes a Chilean-style finiquito from tenure", () => {
    expect(yearsOfService("2021-03-08", "2026-08-18")).toBeGreaterThan(5);
    const finiquito = computeFiniquito({
      sueldoBase: 2_850_000,
      fechaIngreso: "2021-03-08",
      endDate: "2026-08-18",
      vacacionesPendientes: 10,
    });
    expect(finiquito.indemnizacion).toBeGreaterThan(2_850_000);
    expect(finiquito.total).toBe(finiquito.indemnizacion + finiquito.vacaciones + finiquito.aviso);
  });

  it("builds Previred rows from the seeded team", () => {
    const rows = previredRows(EMPLOYEES.filter((e) => e.companyId === "co-andes" && e.estado !== "inactivo"));
    expect(rows[0]?.RUT).toBeTruthy();
    expect(rows[0]?.Imponible).toBeGreaterThan(0);
    expect(rows[0]?.CotizacionAFP).toBeGreaterThan(0);
  });
});
