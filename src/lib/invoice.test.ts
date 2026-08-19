import { describe, expect, it } from "vitest";
import {
  computeInvoiceTotals,
  DEFAULT_IVA_RATE,
  INVOICE_STATUSES,
  isInvoiceStatus,
  isReceivableDocument,
  isRevenueDocument,
  lineAmount,
  nextDocumentNumber,
  nextInvoiceNumber,
  resolveInvoiceStatus,
} from "./invoice";
import { INVOICES } from "./seed";

describe("invoice totals and status", () => {
  it("computes neto, IVA and total from line items using the shipped tax rate", () => {
    const totals = computeInvoiceTotals(
      [
        { quantity: 2, unitPrice: 100_000 },
        { quantity: 1, unitPrice: 50_000 },
      ],
      DEFAULT_IVA_RATE,
    );
    expect(totals.neto).toBe(250_000);
    expect(totals.iva).toBe(Math.round(250_000 * DEFAULT_IVA_RATE));
    expect(totals.total).toBe(totals.neto + totals.iva);
  });

  it("uses the same helper the UI uses on a seeded invoice", () => {
    const invoice = INVOICES[0];
    const totals = computeInvoiceTotals(invoice.items, invoice.taxRate);
    const manual = invoice.items.reduce((sum, item) => sum + lineAmount(item.quantity, item.unitPrice), 0);
    expect(totals.neto).toBe(manual);
    expect(totals.iva).toBe(Math.round(manual * invoice.taxRate));
    expect(totals.total).toBe(totals.neto + totals.iva);
    expect(totals.total).toBeGreaterThan(totals.neto);
  });

  it("exposes the four named Chilean invoice statuses", () => {
    expect(INVOICE_STATUSES).toEqual(["borrador", "enviada", "pagada", "vencida"]);
    expect(isInvoiceStatus("pagada")).toBe(true);
    expect(isInvoiceStatus("anulada")).toBe(false);
  });

  it("marks an enviada invoice as vencida after the due date", () => {
    expect(resolveInvoiceStatus("enviada", "2026-06-01", "2026-08-18")).toBe("vencida");
    expect(resolveInvoiceStatus("enviada", "2026-09-01", "2026-08-18")).toBe("enviada");
    expect(resolveInvoiceStatus("pagada", "2026-01-01", "2026-08-18")).toBe("pagada");
    expect(resolveInvoiceStatus("borrador", "2026-01-01", "2026-08-18")).toBe("borrador");
  });

  it("increments folio numbers from existing invoices", () => {
    expect(nextInvoiceNumber(["F-1042", "F-1051", "F-2102"])).toBe("F-2103");
    expect(nextInvoiceNumber([])).toBe("F-0001");
  });
});

describe("document kinds", () => {
  it("numbers each kind with its own prefix", () => {
    expect(nextDocumentNumber(["F-1051", "C-0088"], "factura")).toBe("F-1052");
    expect(nextDocumentNumber(["F-1051", "C-0088"], "cotizacion")).toBe("C-0089");
    expect(nextDocumentNumber(["NC-0012"], "nota_credito")).toBe("NC-0013");
  });

  it("excludes quotes and credit notes from revenue and receivables", () => {
    expect(isRevenueDocument({ kind: "cotizacion", status: "pagada" })).toBe(false);
    expect(isRevenueDocument({ kind: "factura", status: "pagada" })).toBe(true);
    expect(isReceivableDocument({ kind: "nota_credito", status: "enviada" })).toBe(false);
    expect(isReceivableDocument({ kind: "factura", status: "vencida" })).toBe(true);
  });
});

