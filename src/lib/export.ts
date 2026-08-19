import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { formatCLP } from "./format";

export type ReportRow = Record<string, string | number>;

export function buildExcelBuffer(
  sheetName: string,
  rows: ReportRow[],
): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31));
  const raw = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return raw as ArrayBuffer;
}

export function buildPdfBytes(title: string, lines: string[]): Uint8Array {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 595, 72, "F");
  doc.setTextColor(245, 78, 0);
  doc.setFontSize(18);
  doc.text("Orbix", 40, 44);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(title, 120, 44);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(10);
  let y = 100;
  for (const line of lines) {
    if (y > 780) {
      doc.addPage();
      y = 48;
    }
    doc.text(line, 40, y);
    y += 16;
  }

  const output = doc.output("arraybuffer");
  return new Uint8Array(output);
}

export function rowsFromInvoices(
  invoices: Array<{
    number: string;
    clientName: string;
    status: string;
    issueDate: string;
    dueDate: string;
    neto: number;
    iva: number;
    total: number;
  }>,
): ReportRow[] {
  return invoices.map((invoice) => ({
    Folio: invoice.number,
    Cliente: invoice.clientName,
    Estado: invoice.status,
    Emision: invoice.issueDate,
    Vencimiento: invoice.dueDate,
    Neto: invoice.neto,
    IVA: invoice.iva,
    Total: invoice.total,
  }));
}

export function pdfLinesFromRows(title: string, rows: ReportRow[]): string[] {
  const lines = [title, ""];
  for (const row of rows) {
    const parts = Object.entries(row).map(([key, value]) => {
      if (typeof value === "number" && key.match(/Neto|IVA|Total|Monto|Sueldo|Liquido|Costo/i)) {
        return `${key} ${formatCLP(value)}`;
      }
      return `${key} ${value}`;
    });
    lines.push(parts.join(" · "));
  }
  return lines;
}

export function downloadBlob(filename: string, data: ArrayBuffer | Uint8Array, mime: string) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  const blob = new Blob([copy], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadExcel(filename: string, sheetName: string, rows: ReportRow[]) {
  const buffer = buildExcelBuffer(sheetName, rows);
  downloadBlob(
    filename,
    buffer,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}

export function downloadPdf(filename: string, title: string, lines: string[]) {
  const bytes = buildPdfBytes(title, lines);
  downloadBlob(filename, bytes, "application/pdf");
}
