export type PayLine = { name: string; amount: number };

export type LiquidacionInput = {
  sueldoBase: number;
  horasExtra?: number;
  bono?: number;
  colacion?: number;
  movilizacion?: number;
  afpRate?: number;
  saludRate?: number;
  impuestoUnico?: number;
};

export type LiquidacionBreakdown = {
  haberes: PayLine[];
  descuentos: PayLine[];
  totalHaberes: number;
  totalDescuentos: number;
  imponible: number;
  liquido: number;
};

export const DEFAULT_AFP_RATE = 0.1144;
export const DEFAULT_SALUD_RATE = 0.07;

export function computeLiquidacion(input: LiquidacionInput): LiquidacionBreakdown {
  const horasExtra = Math.round(input.horasExtra ?? 0);
  const bono = Math.round(input.bono ?? 0);
  const colacion = Math.round(input.colacion ?? 0);
  const movilizacion = Math.round(input.movilizacion ?? 0);
  const sueldoBase = Math.round(input.sueldoBase);

  const haberes: PayLine[] = [
    { name: "Sueldo base", amount: sueldoBase },
    { name: "Horas extra", amount: horasExtra },
    { name: "Bono", amount: bono },
    { name: "Colación", amount: colacion },
    { name: "Movilización", amount: movilizacion },
  ].filter((line) => line.amount !== 0 || line.name === "Sueldo base");

  const imponible = sueldoBase + horasExtra + bono;
  const afpRate = input.afpRate ?? DEFAULT_AFP_RATE;
  const saludRate = input.saludRate ?? DEFAULT_SALUD_RATE;
  const afp = Math.round(imponible * afpRate);
  const salud = Math.round(imponible * saludRate);
  const impuesto = Math.round(input.impuestoUnico ?? 0);

  const descuentos: PayLine[] = [
    { name: "AFP", amount: afp },
    { name: "Salud (7%)", amount: salud },
    { name: "Impuesto único", amount: impuesto },
  ].filter((line) => line.amount !== 0 || line.name !== "Impuesto único");

  const totalHaberes = haberes.reduce((sum, line) => sum + line.amount, 0);
  const totalDescuentos = descuentos.reduce((sum, line) => sum + line.amount, 0);

  return {
    haberes,
    descuentos,
    totalHaberes,
    totalDescuentos,
    imponible,
    liquido: totalHaberes - totalDescuentos,
  };
}

export function defaultExtrasForSalary(sueldoBase: number): Pick<
  LiquidacionInput,
  "horasExtra" | "bono" | "colacion" | "movilizacion" | "impuestoUnico"
> {
  return {
    horasExtra: 0,
    bono: sueldoBase >= 2_000_000 ? 180_000 : 80_000,
    colacion: 55_000,
    movilizacion: 45_000,
    impuestoUnico: sueldoBase >= 2_500_000 ? Math.round(sueldoBase * 0.04) : 0,
  };
}

export function yearsOfService(fechaIngreso: string, endDate: string): number {
  const start = Date.parse(fechaIngreso);
  const end = Date.parse(endDate);
  const years = (end - start) / (365.25 * 86_400_000);
  return Math.max(0, Math.round(years * 10) / 10);
}

export type FiniquitoBreakdown = {
  years: number;
  indemnizacion: number;
  vacaciones: number;
  aviso: number;
  total: number;
};

export function computeFiniquito(input: {
  sueldoBase: number;
  fechaIngreso: string;
  endDate: string;
  vacacionesPendientes?: number;
  includeAviso?: boolean;
}): FiniquitoBreakdown {
  const years = yearsOfService(input.fechaIngreso, input.endDate);
  const indemnizacion = Math.round(input.sueldoBase * Math.min(years, 11));
  const vacaciones = Math.round((input.sueldoBase / 30) * (input.vacacionesPendientes ?? 1.25 * 12 * Math.min(years, 1)));
  const aviso = input.includeAviso === false ? 0 : input.sueldoBase;
  return {
    years,
    indemnizacion,
    vacaciones,
    aviso,
    total: indemnizacion + vacaciones + aviso,
  };
}

export function previredRows(
  employees: Array<{
    rut: string;
    firstName: string;
    lastName: string;
    afp: string;
    salud: string;
    sueldoBase: number;
  }>,
) {
  return employees.map((employee) => {
    const extras = defaultExtrasForSalary(employee.sueldoBase);
    const breakdown = computeLiquidacion({ sueldoBase: employee.sueldoBase, ...extras });
    const afp = breakdown.descuentos.find((d) => d.name === "AFP")?.amount ?? 0;
    const salud = breakdown.descuentos.find((d) => d.name.startsWith("Salud"))?.amount ?? 0;
    return {
      RUT: employee.rut,
      Nombre: `${employee.firstName} ${employee.lastName}`,
      AFP: employee.afp,
      Salud: employee.salud,
      Imponible: breakdown.imponible,
      CotizacionAFP: afp,
      CotizacionSalud: salud,
      Liquido: breakdown.liquido,
    };
  });
}
