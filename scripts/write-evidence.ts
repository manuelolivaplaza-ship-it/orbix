import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildExcelBuffer, buildPdfBytes, pdfLinesFromRows, rowsFromInvoices } from "../src/lib/export";
import { computeInvoiceTotals } from "../src/lib/invoice";
import { CLIENTS, INVOICES } from "../src/lib/seed";

const scratch = process.argv[2];
if (!scratch) {
  console.error("usage: npx vite-node scripts/write-evidence.ts <scratch-dir>");
  process.exit(1);
}

mkdirSync(scratch, { recursive: true });

const rows = rowsFromInvoices(
  INVOICES.filter((invoice) => invoice.companyId === "co-andes").map((invoice) => ({
    number: invoice.number,
    clientName: CLIENTS.find((client) => client.id === invoice.clientId)?.name ?? invoice.clientId,
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    ...computeInvoiceTotals(invoice.items, invoice.taxRate),
  })),
);

const excel = buildExcelBuffer("Facturas", rows);
writeFileSync(resolve(scratch, "export.xlsx"), Buffer.from(excel));

const pdf = buildPdfBytes(
  "Reportes Orbix",
  pdfLinesFromRows("Facturas Andes Tecnología SpA", rows),
);
writeFileSync(resolve(scratch, "export.pdf"), Buffer.from(pdf));

console.log(`wrote ${rows.length} invoice rows to ${scratch}`);
