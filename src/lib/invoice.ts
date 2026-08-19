export type InvoiceStatus = "borrador" | "enviada" | "pagada" | "vencida";

export type DocumentKind =
  | "cotizacion"
  | "factura"
  | "boleta"
  | "nota_credito"
  | "nota_debito";

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "borrador",
  "enviada",
  "pagada",
  "vencida",
];

export const DOCUMENT_KINDS: DocumentKind[] = [
  "cotizacion",
  "factura",
  "boleta",
  "nota_credito",
  "nota_debito",
];

export const KIND_PREFIX: Record<DocumentKind, string> = {
  cotizacion: "C",
  factura: "F",
  boleta: "B",
  nota_credito: "NC",
  nota_debito: "ND",
};

export function documentKind(invoice: { kind?: DocumentKind }): DocumentKind {
  return invoice.kind ?? "factura";
}

export function isRevenueDocument(invoice: {
  kind?: DocumentKind;
  status: InvoiceStatus;
}): boolean {
  const kind = documentKind(invoice);
  if (kind === "cotizacion" || kind === "nota_credito") return false;
  return invoice.status === "pagada";
}

export function isReceivableDocument(invoice: {
  kind?: DocumentKind;
  status: InvoiceStatus;
}): boolean {
  const kind = documentKind(invoice);
  if (kind === "cotizacion" || kind === "nota_credito") return false;
  return invoice.status === "enviada" || invoice.status === "vencida";
}

export function nextDocumentNumber(
  existing: string[],
  kind: DocumentKind = "factura",
): string {
  const prefix = KIND_PREFIX[kind];
  let max = 0;
  for (const num of existing) {
    if (!num.startsWith(`${prefix}-`)) continue;
    const match = num.match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

export const DEFAULT_IVA_RATE = 0.19;

export type InvoiceLineInput = {
  quantity: number;
  unitPrice: number;
};

export type InvoiceTotals = {
  neto: number;
  iva: number;
  total: number;
};

export function lineAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice);
}

export function computeInvoiceTotals(
  items: InvoiceLineInput[],
  taxRate: number = DEFAULT_IVA_RATE,
): InvoiceTotals {
  const neto = items.reduce(
    (sum, item) => sum + lineAmount(item.quantity, item.unitPrice),
    0,
  );
  const iva = Math.round(neto * taxRate);
  const total = neto + iva;
  return { neto, iva, total };
}

export function isInvoiceStatus(value: string): value is InvoiceStatus {
  return (INVOICE_STATUSES as string[]).includes(value);
}

/** If an invoice is still "enviada" and past due, it becomes "vencida". */
export function resolveInvoiceStatus(
  status: InvoiceStatus,
  dueDate: string,
  today: string,
): InvoiceStatus {
  if (status === "enviada" && dueDate < today) return "vencida";
  return status;
}

export function nextInvoiceNumber(existing: string[]): string {
  let max = 0;
  for (const num of existing) {
    const match = num.match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `F-${String(max + 1).padStart(4, "0")}`;
}
