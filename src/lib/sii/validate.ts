import { documentKind } from "@/lib/invoice";
import { compactRut, GENERIC_BOLETA_RUT, isValidRut } from "@/lib/rut";
import type { Client, Company, Invoice } from "@/lib/types";
import { resolveDteType, type SiiSettings } from "./dte";

export type EmitIssue = {
  field: string;
  message: string;
};

export function validateIssuer(company: Company | null | undefined): EmitIssue[] {
  const issues: EmitIssue[] = [];
  if (!company) {
    return [{ field: "company", message: "No hay empresa activa." }];
  }
  if (!company.name.trim()) issues.push({ field: "name", message: "Falta la razón social del emisor." });
  if (!isValidRut(company.rut)) issues.push({ field: "rut", message: "El RUT de la empresa no es válido." });
  if (!company.giro.trim()) issues.push({ field: "giro", message: "Falta el giro del emisor." });
  if (!company.address.trim()) issues.push({ field: "address", message: "Falta la dirección del emisor." });
  if (!(company.comuna ?? company.city).trim()) {
    issues.push({ field: "comuna", message: "Falta la comuna del emisor." });
  }
  if (company.acteco && !/^\d{4,6}$/.test(company.acteco.trim())) {
    issues.push({ field: "acteco", message: "El código de actividad económica debe ser de 4 a 6 dígitos." });
  }
  return issues;
}

export function validateReceptor(client: Client | null | undefined, dteType: number | null): EmitIssue[] {
  const issues: EmitIssue[] = [];
  if (!client) return [{ field: "client", message: "Selecciona un receptor." }];
  const isBoleta = dteType === 39 || dteType === 41;
  if (!client.name.trim()) issues.push({ field: "client.name", message: "Falta la razón social del receptor." });
  const rut = client.rut.trim() || (isBoleta ? GENERIC_BOLETA_RUT : "");
  if (!rut) issues.push({ field: "client.rut", message: "El receptor necesita un RUT válido." });
  else if (!isValidRut(rut)) issues.push({ field: "client.rut", message: "El RUT del receptor no es válido." });
  if (!isBoleta) {
    if (!client.giro.trim()) issues.push({ field: "client.giro", message: "La factura requiere giro del receptor." });
    if (!client.address.trim()) {
      issues.push({ field: "client.address", message: "La factura requiere dirección del receptor." });
    }
    if (!(client.comuna ?? client.city).trim()) {
      issues.push({ field: "client.comuna", message: "La factura requiere comuna del receptor." });
    }
  }
  return issues;
}

export function validateInvoiceForEmit(invoice: Invoice): EmitIssue[] {
  const issues: EmitIssue[] = [];
  const kind = documentKind(invoice);
  const dteType = resolveDteType(kind, invoice.taxRate);
  if (!dteType) {
    issues.push({ field: "kind", message: "Una cotización no se timbra en el SII. Conviértela a factura." });
    return issues;
  }
  if (invoice.siiStatus === "aceptado" || invoice.siiStatus === "enviado") {
    issues.push({ field: "sii", message: "Este DTE ya fue emitido. Para corregirlo emite una nota de crédito." });
  }
  const lines = invoice.items.filter((item) => item.description.trim() && item.unitPrice > 0 && item.quantity > 0);
  if (!lines.length) issues.push({ field: "items", message: "Agrega al menos un ítem con descripción, cantidad y precio." });
  if (!invoice.issueDate) issues.push({ field: "issueDate", message: "Falta la fecha de emisión." });
  return issues;
}

export function validateSiiSettings(settings: SiiSettings): EmitIssue[] {
  const issues: EmitIssue[] = [];
  if (settings.provider === "openfactura" && !(settings.apiKey ?? "").trim()) {
    issues.push({
      field: "apiKey",
      message: "Falta la API key de OpenFactura (Haulmer) para emitir en certificación o producción.",
    });
  }
  return issues;
}

export function collectEmitIssues(input: {
  company: Company | null | undefined;
  client: Client | null | undefined;
  invoice: Invoice;
  settings: SiiSettings;
}): EmitIssue[] {
  const kind = documentKind(input.invoice);
  const dteType = resolveDteType(kind, input.invoice.taxRate);
  return [
    ...validateIssuer(input.company),
    ...validateReceptor(input.client, dteType),
    ...validateInvoiceForEmit(input.invoice),
    ...validateSiiSettings(input.settings),
  ];
}

export function sameRut(a: string, b: string): boolean {
  return compactRut(a) === compactRut(b);
}
