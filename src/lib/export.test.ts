import { describe, expect, it } from "vitest";
import { buildExcelBuffer, buildPdfBytes, pdfLinesFromRows, rowsFromInvoices } from "./export";
import { computeInvoiceTotals } from "./invoice";
import { INVOICES } from "./seed";

describe("report export path", () => {
  it("builds a real xlsx buffer from shipped invoice rows", () => {
    const rows = rowsFromInvoices(
      INVOICES.slice(0, 3).map((invoice) => ({
        number: invoice.number,
        clientName: invoice.clientId,
        status: invoice.status,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        ...computeInvoiceTotals(invoice.items, invoice.taxRate),
      })),
    );
    const buffer = buildExcelBuffer("Facturas", rows);
    const bytes = new Uint8Array(buffer);
    expect(bytes.byteLength).toBeGreaterThan(100);
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
  });

  it("builds a real pdf from the same report lines", () => {
    const rows = rowsFromInvoices([
      {
        number: "F-1042",
        clientName: "Mercado Norte SpA",
        status: "pagada",
        issueDate: "2026-03-04",
        dueDate: "2026-04-03",
        neto: 100,
        iva: 19,
        total: 119,
      },
    ]);
    const lines = pdfLinesFromRows("Reportes Orbix", rows);
    const pdf = buildPdfBytes("Reportes Orbix", lines);
    expect(pdf.byteLength).toBeGreaterThan(200);
    expect(String.fromCharCode(pdf[0], pdf[1], pdf[2], pdf[3])).toBe("%PDF");
  });
});
