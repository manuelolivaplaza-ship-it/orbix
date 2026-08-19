import * as XLSX from "xlsx";
import { parseChileanAmount, parseFlexibleDate } from "./money";

export type SpreadsheetSheet = {
  name: string;
  headers: string[];
  rows: Record<string, string>[];
};

export type ChatAttachment = {
  name: string;
  mediaType: string;
  size: number;
  kind: "spreadsheet" | "text" | "other";
  text?: string;
  sheets?: SpreadsheetSheet[];
};

const MAX_ROWS = 250;
const MAX_TEXT = 12_000;

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cellString(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

export function parseChatBuffer(
  name: string,
  mediaType: string,
  size: number,
  buffer: ArrayBuffer,
): ChatAttachment {
  const lower = name.toLowerCase();
  const isSheet =
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".csv") ||
    mediaType.includes("spreadsheet") ||
    mediaType === "text/csv";
  if (isSheet) {
    try {
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const sheets: SpreadsheetSheet[] = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json<(string | number | Date | null)[]>(sheet, {
          header: 1,
          raw: false,
          defval: "",
        });
        const headerRow = (matrix[0] ?? []).map((cell) => cellString(cell));
        const headers = headerRow.map((header, index) => header || `col_${index + 1}`);
        const rows = matrix.slice(1, MAX_ROWS + 1).map((line) => {
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = cellString(line[index]);
          });
          return row;
        }).filter((row) => Object.values(row).some((value) => value.length > 0));
        return { name: sheetName, headers, rows };
      });
      return {
        name,
        mediaType: mediaType || "application/vnd.ms-excel",
        size,
        kind: "spreadsheet",
        sheets,
      };
    } catch {
      return { name, mediaType, size, kind: "other" };
    }
  }

  if (
    lower.endsWith(".txt") ||
    lower.endsWith(".md") ||
    lower.endsWith(".json") ||
    mediaType.startsWith("text/")
  ) {
    const text = new TextDecoder().decode(buffer).slice(0, MAX_TEXT);
    return { name, mediaType: mediaType || "text/plain", size, kind: "text", text };
  }

  return { name, mediaType, size, kind: "other" };
}

export async function parseChatFile(file: File): Promise<ChatAttachment> {
  const buffer = await file.arrayBuffer();
  return parseChatBuffer(file.name, file.type || "", file.size, buffer);
}

function pick(row: Record<string, string>, keys: string[]): string {
  const entries = Object.entries(row);
  for (const key of keys) {
    for (const [header, value] of entries) {
      if (norm(header) === key || norm(header).includes(key)) return value;
    }
  }
  return "";
}

export type MappedInvoiceRow = {
  clientName: string;
  rut: string;
  email: string;
  description: string;
  quantity: number;
  unitPrice: number;
  issueDate?: string;
  dueDate?: string;
  kind?: string;
};

export function mapInvoiceRows(rows: Record<string, string>[], today: string): MappedInvoiceRow[] {
  return rows
    .map((row) => {
      const clientName = pick(row, ["cliente", "client", "nombre", "razon social", "razon"]);
      const description =
        pick(row, ["descripcion", "glosa", "item", "concepto", "detalle", "servicio", "producto"]) ||
        "Servicio";
      const qtyRaw = pick(row, ["cantidad", "qty", "cant", "unidades"]);
      const priceRaw =
        pick(row, ["precio", "unitario", "valor unitario"]) ||
        pick(row, ["total", "monto", "neto", "valor"]);
      const quantity = Math.max(1, parseChileanAmount(qtyRaw) ?? 1);
      let unitPrice = parseChileanAmount(priceRaw) ?? 0;
      const total = parseChileanAmount(pick(row, ["total", "monto"]));
      if (total && quantity > 1 && !pick(row, ["precio", "unitario"])) {
        unitPrice = Math.round(total / quantity);
      }
      return {
        clientName,
        rut: pick(row, ["rut"]),
        email: pick(row, ["email", "correo"]),
        description,
        quantity,
        unitPrice,
        issueDate: parseFlexibleDate(pick(row, ["fecha", "emision"]) || undefined, today),
        dueDate: parseFlexibleDate(pick(row, ["vencimiento", "vence"]) || undefined, ""),
        kind: pick(row, ["tipo", "documento", "kind"]),
      };
    })
    .filter((row) => row.clientName && row.unitPrice > 0);
}

export function mapClientRows(rows: Record<string, string>[]): Array<{
  name: string;
  rut: string;
  email: string;
  phone: string;
  giro: string;
  city: string;
  address: string;
}> {
  return rows
    .map((row) => ({
      name: pick(row, ["cliente", "nombre", "razon social", "razon"]),
      rut: pick(row, ["rut"]),
      email: pick(row, ["email", "correo"]),
      phone: pick(row, ["telefono", "fono", "phone"]),
      giro: pick(row, ["giro", "actividad"]),
      city: pick(row, ["ciudad", "comuna"]),
      address: pick(row, ["direccion", "address"]),
    }))
    .filter((row) => row.name.length > 1);
}

export function detectSheetMode(headers: string[]): "invoices" | "clients" {
  const joined = headers.map(norm).join(" ");
  if (/(monto|total|precio|neto|glosa|descripcion|cantidad)/.test(joined)) return "invoices";
  return "clients";
}
