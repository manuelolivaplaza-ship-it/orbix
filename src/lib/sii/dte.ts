import type { DocumentKind } from "@/lib/invoice";

export type DteType = 33 | 34 | 39 | 41 | 52 | 56 | 61;

export type SiiEnvironment = "sandbox" | "certificacion" | "produccion";
export type SiiProvider = "sandbox" | "openfactura";
export type SiiDocStatus = "pendiente" | "enviado" | "aceptado" | "rechazado" | "anulado";
export type PaymentMethod = "contado" | "credito";

export type FolioRange = {
  next: number;
  from: number;
  to: number;
};

export type SiiSettings = {
  environment: SiiEnvironment;
  provider: SiiProvider;
  apiKey?: string;
  connected: boolean;
  lastTestAt?: string;
  lastError?: string;
  folios: Partial<Record<DteType, FolioRange>>;
};

export const DTE_LABEL: Record<DteType, string> = {
  33: "Factura electrónica",
  34: "Factura exenta electrónica",
  39: "Boleta electrónica",
  41: "Boleta exenta electrónica",
  52: "Guía de despacho",
  56: "Nota de débito electrónica",
  61: "Nota de crédito electrónica",
};

export const TAXABLE_DTE: DteType[] = [33, 39, 56, 61];

export function defaultFolioRange(): FolioRange {
  return { next: 1, from: 1, to: 1000 };
}

export function defaultSiiSettings(): SiiSettings {
  return {
    environment: "sandbox",
    provider: "sandbox",
    connected: false,
    folios: {
      33: defaultFolioRange(),
      34: defaultFolioRange(),
      39: defaultFolioRange(),
      41: defaultFolioRange(),
      56: defaultFolioRange(),
      61: defaultFolioRange(),
    },
  };
}

export function resolveDteType(kind: DocumentKind, taxRate: number): DteType | null {
  if (kind === "cotizacion") return null;
  if (kind === "factura") return taxRate === 0 ? 34 : 33;
  if (kind === "boleta") return taxRate === 0 ? 41 : 39;
  if (kind === "nota_credito") return 61;
  if (kind === "nota_debito") return 56;
  return null;
}

export function dteKindLabel(type: DteType | null | undefined): string {
  if (!type) return "Documento";
  return DTE_LABEL[type];
}

export function isDteKind(kind: DocumentKind): boolean {
  return kind !== "cotizacion";
}

export function paymentCode(method: PaymentMethod | undefined): 1 | 2 {
  return method === "contado" ? 1 : 2;
}

export function allocateFolio(settings: SiiSettings, type: DteType): {
  ok: true;
  folio: number;
  settings: SiiSettings;
} | { ok: false; message: string } {
  const range = settings.folios[type] ?? defaultFolioRange();
  if (range.next > range.to) {
    return {
      ok: false,
      message: `Se acabaron los folios CAF del tipo ${type} (${range.from}–${range.to}). Carga un rango nuevo.`,
    };
  }
  const folio = range.next;
  return {
    ok: true,
    folio,
    settings: {
      ...settings,
      folios: {
        ...settings.folios,
        [type]: { ...range, next: folio + 1 },
      },
    },
  };
}

export function openFacturaBaseUrl(environment: SiiEnvironment): string {
  if (environment === "produccion") return "https://api.haulmer.com";
  return "https://dev-api.haulmer.com";
}
